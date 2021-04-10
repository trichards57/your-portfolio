using AutoFixture;
using FluentAssertions;
using Microsoft.Azure.Cosmos;
using PortfolioServer.Model;
using PortfolioServer.RequestModel;
using PortfolioServer.Services;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace PortfolioServer.Test.Services
{
    public class ShiftServiceTests : IDisposable
    {
        private const string StandardEndPoint = "https://localhost:8081";
        private const string StandardKey = "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";
        private const string TestContainer = "testcontainer";
        private const string TestDb = "testdb";
        private readonly CosmosClient _client;

        public ShiftServiceTests()
        {
            _client = new CosmosClient(StandardEndPoint, StandardKey, new CosmosClientOptions
            {
                ApplicationName = "ShiftsTests",
            });
        }

        [Fact]
        public async Task AddJobReturnsFalseIfShiftDoesNotExist()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var testJob = fixture.Create<NewJob>();
            var userId = fixture.Create<string>();

            var res = await service.AddJob(userId, testJob);

            res.Should().BeFalse();
        }

        [Fact]
        public async Task AddJobReturnsTrueIfJobAdded()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var userId = fixture.Create<string>();
            var testShift = fixture.Build<Shift>()
                .With(s => s.UserId, userId)
                .With(s => s.Deleted, false)
                .Without(s => s.Jobs)
                .Create();
            var testJob = fixture.Build<NewJob>()
                .With(j => j.Shift, testShift.Id)
                .Create();
            var expectedJob = new Job
            {
                Age = testJob.Age,
                BlueLights = testJob.BlueLights,
                Category = testJob.Category,
                Drove = testJob.Drove,
                Gender = testJob.Gender,
                Notes = testJob.Notes,
                Outcome = testJob.Outcome,
                ReflectionFlag = testJob.ReflectionFlag,
            };

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");

            await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(testShift, new PartitionKey(userId));

            var res = await service.AddJob(userId, testJob);

            res.Should().BeTrue();

            var container = _client.GetContainer(TestDb, TestContainer);
            var shiftResponse = await container.ReadItemAsync<Shift>(testShift.Id, new PartitionKey(userId));

            var shift = shiftResponse.Resource;

            shift.Jobs.Should().ContainSingle();
            shift.Jobs.Single().Should().BeEquivalentTo(expectedJob);
        }

        [Fact]
        public async Task AddJobThrowsOnEmptyUserId()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var testJob = fixture.Create<NewJob>();

            var func = new Func<Task>(() => service.AddJob(string.Empty, testJob));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task AddJobThrowsOnNullJob()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var userId = fixture.Create<string>();

            var func = new Func<Task>(() => service.AddJob(userId, null));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task AddShiftAddsShift()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var testShift = fixture.Create<NewShift>();
            var userId = fixture.Create<string>();

            var res = await service.AddShift(userId, testShift);

            res.Should().NotBeNullOrEmpty();

            var container = _client.GetContainer(TestDb, TestContainer);
            var shiftResponse = await container.ReadItemAsync<Shift>(res, new PartitionKey(userId));

            var shift = shiftResponse.Resource;

            shift.CrewMate.Should().Be(testShift.CrewMate);
            shift.Date.Should().Be(testShift.Date);
            shift.Duration.Should().Be(testShift.Duration);
            shift.Event.Should().Be(testShift.Event);
            shift.Id.Should().Be(res);
            shift.Jobs.Should().BeEmpty();
            shift.Location.Should().Be(testShift.Location);
            shift.Role.Should().Be(testShift.Role);
            shift.UserId.Should().Be(userId);
            shift.Deleted.Should().BeFalse();
        }

        [Fact]
        public async Task AddShiftThrowsOnEmptyUserId()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var testJob = fixture.Create<NewShift>();

            var func = new Func<Task>(() => service.AddShift(string.Empty, testJob));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task AddShiftThrowsOnNullShift()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var userId = fixture.Create<string>();

            var func = new Func<Task>(() => service.AddShift(userId, null));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        public async void Dispose()
        {
            var db = _client.GetDatabase(TestDb);
            try
            {
                await db.DeleteAsync();
            }
            catch (CosmosException) { }
            finally
            {
                _client.Dispose();
            }
        }

        [Fact]
        public async Task GetAllShiftsGetsAllUsersShifts()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var userId = fixture.Create<string>();

            var usersShifts = fixture.Build<Shift>()
                .With(s => s.UserId, userId)
                .With(s => s.Deleted, false)
                .CreateMany();
            var otherShifts = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .CreateMany();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");

            foreach (var shift in usersShifts)
                await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(shift, new PartitionKey(shift.UserId));
            foreach (var shift in otherShifts)
                await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(shift, new PartitionKey(shift.UserId));

            var actual = await service.GetAllShifts(userId);
            actual.Should().BeEquivalentTo(usersShifts);
        }

        [Fact]
        public async Task GetAllShiftsThrowsOnEmptyUser()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var func = new Func<Task>(() => service.GetAllShifts(string.Empty));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task GetShiftReturnsCorrectShift()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var fixture = new Fixture();
            var testShifts = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .CreateMany();
            var expectedShift = testShifts.Skip(1).Take(1).First();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");

            foreach (var shift in testShifts)
                await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(shift, new PartitionKey(shift.UserId));

            var actual = await service.GetShift(expectedShift.UserId, expectedShift.Id);

            actual.Should().BeEquivalentTo(expectedShift);
        }

        [Fact]
        public async Task GetShiftReturnsNullIfNotFound()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var fixture = new Fixture();
            var testShifts = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .CreateMany();
            var expectedShift = testShifts.Skip(1).Take(1).First();
            var testId = fixture.Create<string>();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");

            foreach (var shift in testShifts)
                await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(shift, new PartitionKey(shift.UserId));

            var actual = await service.GetShift(expectedShift.UserId, testId);

            actual.Should().BeNull();
        }

        [Fact]
        public async Task GetShiftReturnsNullWithWrongUser()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var fixture = new Fixture();
            var testShifts = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .CreateMany();
            var expectedShift = testShifts.Skip(1).Take(1).First();
            var testId = fixture.Create<string>();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");

            foreach (var shift in testShifts)
                await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(shift, new PartitionKey(shift.UserId));

            var actual = await service.GetShift(testId, expectedShift.Id);

            actual.Should().BeNull();
        }

        [Fact]
        public async Task GetShiftThrowsOnEmptyUser()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var testId = fixture.Create<string>();

            var func = new Func<Task>(() => service.GetShift(string.Empty, testId));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task GetShiftThrowsOnShiftId()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var testId = fixture.Create<string>();

            var func = new Func<Task>(() => service.GetShift(testId, null));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task UpdateShiftThrowsOnEmptyUserId()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var testJob = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .Create();

            var func = new Func<Task>(() => service.UpdateShift(string.Empty, testJob));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task UpdateShiftThrowsOnNullShift()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var userId = fixture.Create<string>();

            var func = new Func<Task>(() => service.UpdateShift(userId, null));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task UpdateShiftUpdatesDatabase()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var userId = fixture.Create<string>();
            var testOriginalShift = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .With(s => s.UserId, userId).Create();
            var testNewShift = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .With(s => s.Id, testOriginalShift.Id)
                .With(s => s.UserId, userId).Create();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");
            await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(testOriginalShift, new PartitionKey(userId));

            await service.UpdateShift(userId, testNewShift);

            var shiftResponse = await _client.GetContainer(TestDb, TestContainer).ReadItemAsync<Shift>(testOriginalShift.Id, new PartitionKey(userId));
            var actualShift = shiftResponse.Resource;

            actualShift.Should().BeEquivalentTo(testNewShift);
        }

        [Fact]
        public async Task UpdateShiftWithWrongUserDoesNotUpdateDatabase()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);
            var fixture = new Fixture();

            var userId = fixture.Create<string>();
            var testOriginalShift = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .With(s => s.UserId, userId).Create();
            var testNewShift = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .With(s => s.Id, testOriginalShift.Id).Create();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");
            await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(testOriginalShift, new PartitionKey(userId));

            await service.UpdateShift(userId, testNewShift);

            var shiftResponse = await _client.GetContainer(TestDb, TestContainer).ReadItemAsync<Shift>(testOriginalShift.Id, new PartitionKey(userId));
            var actualShift = shiftResponse.Resource;

            actualShift.Should().BeEquivalentTo(testOriginalShift);
        }
    }
}
