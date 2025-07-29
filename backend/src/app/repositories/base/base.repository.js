// core/repositories/BaseRepository.js
export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async getAll() {
    return this.model.find();
  }

  async find(query = {}) {
    return this.model.find(query);
  }

  async getById(id) {
    return this.model.findById(id);
  }

  async create(data) {
    const instance = new this.model(data);
    return instance.save();
  }

  async updateById(id, data) {
    return this.model.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
}
