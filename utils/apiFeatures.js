class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search() {
    if (this.queryString.search) {
      const keyword = {
        $or: [
          { name: { $regex: this.queryString.search, $options: 'i' } },
          { cuisineType: { $regex: this.queryString.search, $options: 'i' } },
          { address: { $regex: this.queryString.search, $options: 'i' } },
        ],
      };
      this.query = this.query.find({ ...keyword });
    }
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryString };

    // Fields to exclude
    const removeFields = ['search', 'sort', 'page', 'limit', 'fields'];
    removeFields.forEach((el) => delete queryCopy[el]);

    // Handle Mongoose syntax for operators like gte, gt, lte, lt
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
