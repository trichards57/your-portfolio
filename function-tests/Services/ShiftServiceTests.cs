﻿using AutoFixture;
using FluentAssertions;
using Microsoft.Azure.Cosmos;
using PortfolioServer.Model;
using PortfolioServer.RequestModel;
using PortfolioServer.Services;
using PortfolioServer.Test.Helpers;
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
        private const string TestContainerRoot = "testcontainer";
        private const string TestDbRoot = "testdb";
        private static readonly Fixture fixture = new Fixture();
        private static readonly object runCounterLock = new object();
        private static int runCounter = 0;
        private readonly CosmosClient _client;
        private readonly string TestContainer;
        private readonly string TestDb;

        static ShiftServiceTests()
        {
            fixture.Customizations.Add(new TimeSpanBuilder());
        }

        public ShiftServiceTests()
        {
            _client = new CosmosClient(StandardEndPoint, StandardKey, new CosmosClientOptions
            {
                ApplicationName = "ShiftsTests"
            });

            lock (runCounterLock)
            {
                TestContainer = $"{TestContainerRoot}{runCounter}";
                TestDb = $"{TestDbRoot}{runCounter}";
                runCounter++;
            }
        }

        [Fact]
        public async Task AddJobReturnsFalseIfShiftDoesNotExist()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var testJob = fixture.Create<NewJob>();
            var userId = fixture.Create<string>();

            var res = await service.AddJob(userId, testJob);

            res.Should().BeFalse();
        }

        [Fact]
        public async Task AddJobReturnsFalseIfShiftIsDeleted()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();

            var testShift = fixture.Build<Shift>()
               .With(s => s.UserId, userId)
               .With(s => s.Deleted, true)
               .Without(s => s.Jobs)
               .Create();
            var testJob = fixture.Build<NewJob>()
                .With(j => j.Shift, testShift.Id)
                .Create();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");

            await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(testShift, new PartitionKey(userId));

            var res = await service.AddJob(userId, testJob);

            res.Should().BeFalse();
        }

        [Fact]
        public async Task AddJobReturnsTrueIfJobAdded()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

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
            var a = await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(testShift, new PartitionKey(userId));

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

            var testJob = fixture.Create<NewJob>();

            var func = new Func<Task>(() => service.AddJob(string.Empty, testJob));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task AddJobThrowsOnNullJob()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();

            var func = new Func<Task>(() => service.AddJob(userId, null));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task AddShiftAddsShift()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

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

            var testJob = fixture.Create<NewShift>();

            var func = new Func<Task>(() => service.AddShift(string.Empty, testJob));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task AddShiftThrowsOnNullShift()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();

            var func = new Func<Task>(() => service.AddShift(userId, null));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task DeleteShiftThrowsOnEmptyUserId()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var testShiftId = fixture.Create<string>();

            var func = new Func<Task>(() => service.DeleteShift(string.Empty, testShiftId));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task DeleteShiftThrowsOnNullShift()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();

            var func = new Func<Task>(() => service.DeleteShift(userId, null));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task DeleteShiftUpdatesDatabase()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();
            var testOriginalShift = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .With(s => s.UserId, userId).Create();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");
            await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(testOriginalShift, new PartitionKey(userId));

            var res = await service.DeleteShift(userId, testOriginalShift.Id);

            var shiftResponse = await _client.GetContainer(TestDb, TestContainer).ReadItemAsync<Shift>(testOriginalShift.Id, new PartitionKey(userId));
            var actualShift = shiftResponse.Resource;

            actualShift.Deleted.Should().BeTrue();
            res.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteShiftWithNotFoundReturnsFalse()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();
            var badShiftId = fixture.Create<string>();

            var res = await service.DeleteShift(userId, badShiftId);

            res.Should().BeFalse();
        }

        [Fact]
        public async Task DeleteShiftWithWrongUserDoesNotUpdateDatabase()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();
            var badUserId = fixture.Create<string>();
            var testOriginalShift = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .With(s => s.UserId, userId).Create();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");
            await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(testOriginalShift, new PartitionKey(userId));

            var res = await service.DeleteShift(badUserId, testOriginalShift.Id);

            var shiftResponse = await _client.GetContainer(TestDb, TestContainer).ReadItemAsync<Shift>(testOriginalShift.Id, new PartitionKey(userId));
            var actualShift = shiftResponse.Resource;

            actualShift.Should().BeEquivalentTo(testOriginalShift);
            res.Should().BeFalse();
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

            var userId = fixture.Create<string>();

            var usersShifts = fixture.Build<Shift>()
                .With(s => s.UserId, userId)
                .With(s => s.Deleted, false)
                .CreateMany();
            var deletedShifts = fixture.Build<Shift>()
                .With(s => s.UserId, userId)
                .With(s => s.Deleted, true)
                .CreateMany();
            var otherShifts = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .CreateMany();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");

            foreach (var shift in usersShifts)
                await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(shift, new PartitionKey(shift.UserId));
            foreach (var shift in deletedShifts)
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
        public async Task GetShiftReturnsNullIfDeleted()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var testShifts = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .CreateMany();
            var expectedShift = testShifts.Skip(1).Take(1).First();
            expectedShift.Deleted = true;

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");

            foreach (var shift in testShifts)
                await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(shift, new PartitionKey(shift.UserId));

            var actual = await service.GetShift(expectedShift.UserId, expectedShift.Id);

            actual.Should().BeNull();
        }

        [Fact]
        public async Task GetShiftReturnsNullIfNotFound()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

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

            var testId = fixture.Create<string>();

            var func = new Func<Task>(() => service.GetShift(string.Empty, testId));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task GetShiftThrowsOnShiftId()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var testId = fixture.Create<string>();

            var func = new Func<Task>(() => service.GetShift(testId, null));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task UndeleteShiftThrowsOnEmptyUserId()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var testShiftId = fixture.Create<string>();

            var func = new Func<Task>(() => service.DeleteShift(string.Empty, testShiftId));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task UndeleteShiftThrowsOnNullShift()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();

            var func = new Func<Task>(() => service.DeleteShift(userId, null));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task UndeleteShiftUpdatesDatabase()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();
            var testOriginalShift = fixture.Build<Shift>()
                .With(s => s.Deleted, true)
                .With(s => s.UserId, userId).Create();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");
            await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(testOriginalShift, new PartitionKey(userId));

            var res = await service.UndeleteShift(userId, testOriginalShift.Id);

            var shiftResponse = await _client.GetContainer(TestDb, TestContainer).ReadItemAsync<Shift>(testOriginalShift.Id, new PartitionKey(userId));
            var actualShift = shiftResponse.Resource;

            actualShift.Deleted.Should().BeFalse();
            res.Should().BeTrue();
        }

        [Fact]
        public async Task UndeleteShiftWithNotFoundReturnsFalse()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();
            var badShiftId = fixture.Create<string>();

            var res = await service.UndeleteShift(userId, badShiftId);

            res.Should().BeFalse();
        }

        [Fact]
        public async Task UndeleteShiftWithWrongUserDoesNotUpdateDatabase()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();
            var badUserId = fixture.Create<string>();
            var testOriginalShift = fixture.Build<Shift>()
                .With(s => s.Deleted, true)
                .With(s => s.UserId, userId).Create();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");
            await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(testOriginalShift, new PartitionKey(userId));

            var res = await service.UndeleteShift(badUserId, testOriginalShift.Id);

            var shiftResponse = await _client.GetContainer(TestDb, TestContainer).ReadItemAsync<Shift>(testOriginalShift.Id, new PartitionKey(userId));
            var actualShift = shiftResponse.Resource;

            actualShift.Should().BeEquivalentTo(testOriginalShift);
            res.Should().BeFalse();
        }

        [Fact]
        public async Task UpdateShiftThrowsOnEmptyUserId()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

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

            var userId = fixture.Create<string>();

            var func = new Func<Task>(() => service.UpdateShift(userId, null));
            await func.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task UpdateShiftUpdatesDatabase()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

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

            var res = await service.UpdateShift(userId, testNewShift);

            var shiftResponse = await _client.GetContainer(TestDb, TestContainer).ReadItemAsync<Shift>(testOriginalShift.Id, new PartitionKey(userId));
            var actualShift = shiftResponse.Resource;

            actualShift.Should().BeEquivalentTo(testNewShift);
            res.Should().BeTrue();
        }

        [Fact]
        public async Task UpdateShiftWithDeletedShiftDoesNotUpdateDatabase()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();
            var testOriginalShift = fixture.Build<Shift>()
                .With(s => s.Deleted, true)
                .With(s => s.UserId, userId).Create();
            var testNewShift = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .With(s => s.Id, testOriginalShift.Id)
                .With(s => s.UserId, userId).Create();

            await _client.CreateDatabaseIfNotExistsAsync(TestDb);
            await _client.GetDatabase(TestDb).CreateContainerIfNotExistsAsync(TestContainer, "/userId");
            await _client.GetContainer(TestDb, TestContainer).CreateItemAsync(testOriginalShift, new PartitionKey(userId));

            var res = await service.UpdateShift(userId, testNewShift);

            var shiftResponse = await _client.GetContainer(TestDb, TestContainer).ReadItemAsync<Shift>(testOriginalShift.Id, new PartitionKey(userId));
            var actualShift = shiftResponse.Resource;

            actualShift.Should().BeEquivalentTo(testOriginalShift);
            res.Should().BeFalse();
        }

        [Fact]
        public async Task UpdateShiftWithNotFoundReturnsFalse()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

            var userId = fixture.Create<string>();
            var testNewShift = fixture.Build<Shift>()
                .With(s => s.UserId, userId)
                .With(s => s.Deleted, false).Create();

            var res = await service.UpdateShift(userId, testNewShift);

            res.Should().BeFalse();
        }

        [Fact]
        public async Task UpdateShiftWithWrongUserDoesNotUpdateDatabase()
        {
            IShiftService service = new ShiftService(_client, TestDb, TestContainer);

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

            var res = await service.UpdateShift(userId, testNewShift);

            var shiftResponse = await _client.GetContainer(TestDb, TestContainer).ReadItemAsync<Shift>(testOriginalShift.Id, new PartitionKey(userId));
            var actualShift = shiftResponse.Resource;

            actualShift.Should().BeEquivalentTo(testOriginalShift);
            res.Should().BeFalse();
        }
    }
}
