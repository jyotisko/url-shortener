class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  paginate() {
    const page = this.query.page || 1;
    const limit = this.query.limit || 10;
    const skip = (page - 1) * limit;

    this.queryString.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;