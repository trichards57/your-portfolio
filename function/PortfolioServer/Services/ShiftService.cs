using Microsoft.Azure.Cosmos;
using PortfolioServer.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PortfolioServer.Services
{
    public interface IShiftService
    {
        Task<string> AddShift(string userId, NewShift shift);

        Task<IEnumerable<Shift>> GetAllShifts(string userId);

        Task<Shift> GetShift(string userId, string id);

        Task UpdateShift(string userId, Shift shift);
    }

    internal class ShiftService : IShiftService
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

        public async Task<string> AddShift(string userId, NewShift shift)
        {
            var newShift = new Shift
            {
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
            using var resultSet = _container.GetItemQueryIterator<Shift>(new QueryDefinition($"select * from {_containerId} s where s.UserId = @UserId").WithParameter("@UserId", userId), requestOptions: new QueryRequestOptions
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
            try
            {
                var item = (Shift)(await _container.ReadItemAsync<Shift>(id, new PartitionKey(userId)));

                if (item?.UserId == userId)
                    return item;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound) { }

            return null;
        }

        public async Task Initialise()
        {
            _database = await _client.CreateDatabaseIfNotExistsAsync(_databaseId);
            _container = await _database.CreateContainerIfNotExistsAsync(_containerId, "/UserId");
        }

        public async Task UpdateShift(string userId, Shift shift)
        {
            await _container.ReplaceItemAsync(shift, shift.Id, new PartitionKey(userId), new ItemRequestOptions
            {
                EnableContentResponseOnWrite = true
            });
        }
    }
}
