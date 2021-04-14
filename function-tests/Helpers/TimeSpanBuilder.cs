using AutoFixture.Kernel;
using System;
using System.Reflection;

namespace PortfolioServer.Test.Helpers
{
    internal class TimeSpanBuilder : ISpecimenBuilder
    {
        public object Create(object request, ISpecimenContext context)
        {
            var pi = request as ParameterInfo;
            if (pi == null)
                return new NoSpecimen();

            if (pi.ParameterType != typeof(long) || pi.Name != "ticks")
                return new NoSpecimen();

            var range = context.Resolve(new RangedNumberRequest(typeof(int), 1, 24));

            if (range is NoSpecimen)
                return new NoSpecimen();

            return (int)((double)(int)range / 2) * TimeSpan.TicksPerHour;
        }
    }
}
