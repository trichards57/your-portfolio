using FluentAssertions;
using Newtonsoft.Json;
using PortfolioServer.Converters;
using System;
using Xunit;

namespace PortfolioServer.Test.Converters
{
    public class TimespanConverterTests
    {
        [Fact]
        public void ReadHandlesDoubles()
        {
            var testText = "{ \"Value\": 8.2 }";

            var testResult = JsonConvert.DeserializeObject<TestClass>(testText);

            testResult.Value.Should().Be(TimeSpan.FromHours(8.2));
        }

        [Fact]
        public void ReadHandlesIntegers()
        {
            var testText = "{ \"Value\": 8 }";

            var testResult = JsonConvert.DeserializeObject<TestClass>(testText);

            testResult.Value.Should().Be(TimeSpan.FromHours(8));
        }

        [Fact]
        public void ReadHandlesInvalidValues()
        {
            var testText = "{ \"Value\": \"abc\" }";

            var testResult = JsonConvert.DeserializeObject<TestClass>(testText);

            testResult.Value.Should().Be(TimeSpan.Zero);
        }

        [Fact]
        public void WriteOutputsValue()
        {
            var testValue = new TestClass
            {
                Value = TimeSpan.FromHours(8)
            };

            var actualText = JsonConvert.SerializeObject(testValue, Formatting.None);

            actualText.Should().Be("{\"Value\":8.0}");
        }

        public class TestClass
        {
            [JsonConverter(typeof(TimespanConverter))]
            public TimeSpan Value { get; set; }
        }
    }
}
