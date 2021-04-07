using Microsoft.Azure.Cosmos;
using PortfolioServer.Model;
using PortfolioServer.RequestModel;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PortfolioServer.Services
{
    public interface IShiftService
    {
        Task<bool> AddJob(string userId, NewJob job);

        Task<string> AddShift(string userId, NewShift shift);

        Task<IEnumerable<Shift>> GetAllShifts(string userId);

        Task<Shift> GetShift(string userId, string id);

        Task UpdateShift(string userId, Shift shift);
    }

    public class ShiftService : IShiftService
    {
        private readonly CosmosClient _client;
        private readonly string _containerId;
        private readonly string _databaseId;
        private Container _container;
        private Database _database;

        public ShiftService(CosmosClient client, string databaseId, string containerId)
        {
            _client = client;
            _containerId = containerId;
            _databaseId = databaseId;
        }

        public async Task<bool> AddJob(string userId, NewJob job)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException($"'{nameof(userId)}' cannot be null or whitespace", nameof(userId));

            if (job is null)
                throw new ArgumentNullException(nameof(job));

            await Initialise();

            var newJob = new Job
            {
                Age = job.Age,
                BlueLights = job.BlueLights,
                Category = job.Category,
                Drove = job.Drove,
                Gender = job.Gender,
                Notes = job.Notes,
                Outcome = job.Outcome,
                ReflectionFlag = job.ReflectionFlag
            };

            var shift = await GetShift(userId, job.Shift);

            if (shift == null)
                return false;

            shift.Jobs.Add(newJob);

            await _container.ReplaceItemAsync(shift, shift.Id, new PartitionKey(userId), new ItemRequestOptions
            {
                EnableContentResponseOnWrite = false
            });

            return true;
        }

        public async Task<string> AddShift(string userId, NewShift shift)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException($"'{nameof(userId)}' cannot be null or whitespace", nameof(userId));

            if (shift is null)
                throw new ArgumentNullException(nameof(shift));

            await Initialise();

            var newShift = new Shift
            {
                Id = Guid.NewGuid().ToString("N"),
                CrewMate = shift.CrewMate,
                Date = shift.Date,
                Duration = shift.Duration,
                Event = shift.Event,
                Location = shift.Location,
                Role = shift.Role,
                UserId = userId
            };

            var response = await _container.CreateItemAsync(newShift, new PartitionKey(userId));
            return response.Resource.Id;
        }

        public async Task<IEnumerable<Shift>> GetAllShifts(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException($"'{nameof(userId)}' cannot be null or whitespace", nameof(userId));

            await Initialise();

            using var resultSet = _container.GetItemQueryIterator<Shift>(new QueryDefinition($"select * from {_containerId} s where s.userId = @UserId").WithParameter("@UserId", userId), requestOptions: new QueryRequestOptions
            {
                PartitionKey = new PartitionKey(userId)
            });
            var result = new List<Shift>();

            while (resultSet.HasMoreResults)
            {
                var res = await resultSet.ReadNextAsync();

                result.AddRange(res);
            }

            return result;
        }

        public async Task<Shift> GetShift(string userId, string id)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException($"'{nameof(userId)}' cannot be null or whitespace", nameof(userId));

            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentException($"'{nameof(id)}' cannot be null or whitespace", nameof(id));

            await Initialise();

            try
            {
                var item = (Shift)(await _container.ReadItemAsync<Shift>(id, new PartitionKey(userId)));

                if (item?.UserId == userId)
                    return item;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound) { }

            return null;
        }

        public async Task UpdateShift(string userId, Shift shift)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException($"'{nameof(userId)}' cannot be null or whitespace", nameof(userId));

            if (shift is null)
                throw new ArgumentNullException(nameof(shift));

            await Initialise();

            try
            {
                await _container.ReplaceItemAsync(shift, shift.Id, new PartitionKey(userId), new ItemRequestOptions
                {
                    EnableContentResponseOnWrite = false
                });
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.BadRequest) { }
        }

        private async Task Initialise()
        {
            if (_database == null)
                _database = await _client.CreateDatabaseIfNotExistsAsync(_databaseId);
            if (_container == null)
                _container = await _database.CreateContainerIfNotExistsAsync(_containerId, "/userId");
        }
    }
}
