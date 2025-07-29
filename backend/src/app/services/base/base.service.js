// core/services/BaseService.js
export default class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAll() {
    return this.repository.getAll();
  }

  async getById(id) {
    return this.repository.getById(id);
  }

  async create(data) {
    return this.repository.create(data);
  }

  async updateById(id, data) {
    return this.repository.updateById(id, data);
  }

  async deleteById(id) {
    return this.repository.deleteById(id);
  }
}
