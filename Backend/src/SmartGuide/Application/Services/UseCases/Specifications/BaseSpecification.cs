using Application.Services.Interfaces.Home;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace Application.Services.UseCases.Specifications
{
    public class BaseSpecification<T> : ISpecification<T>
    {
        public Expression<Func<T, bool>> Criteria { get; protected set; }

        public Expression<Func<T, object>> OrderBy { get; protected set; }
        public Expression<Func<T, object>> OrderByDesc { get; protected set; }

        public int Skip { get; protected set; }
        public int Take { get; protected set; }
        public bool IsPagingEnabled { get; protected set; }

        protected void ApplyPaging(int skip, int take)
        {
            Skip = skip;
            Take = take;
            IsPagingEnabled = true;
        }
    }
}
