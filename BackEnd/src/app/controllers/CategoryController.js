import * as Yup from 'yup';
import { Op } from 'sequelize';
import Category from '../models/Category';

class CategoryController {
  async list(req, res) {
    const category = await Category.findAll({
      where: {
        [Op.or]: [{ user_id: req.userId }, { user_id: null }],
      },
      attributes: ['id', 'name'],
      order: ['id'],
    });

    if (!category) {
      return res
        .status(404)
        .json({ error: 'You do not have categorys created yet' });
    }

    return res.json(category);
  }

  async index(req, res) {
    const category = await Category.findOne({
      where: {
        category_id: req.query.categoryId,
        [Op.or]: [{ user_id: req.userId }, { user_id: null }],
      },
    });

    if (!category) {
      return res.status(400).json({ error: 'Category does not exists' });
    }

    return res.json(category);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { name } = req.body;
    const user_id = req.userId;

    const category = await Category.findOne({ where: { user_id, name } });

    if (category) {
      return res.status(404).json({ error: 'This category already exists' });
    }

    const newCategory = await Category.create({ name, user_id });

    return res.json(newCategory);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const category = await Category.findByPk(req.query.movimentId);

    if (!category) {
      return res.status(404).json({ error: 'This category does not exists' });
    }

    if (category.user_id !== req.userId) {
      return res
        .status(400)
        .json({ error: 'You do not have permission for this category' });
    }

    const { name } = req.body;

    const checkCategoryExists = await Category.findOne({ where: { name } });

    if (checkCategoryExists) {
      return res.status(404).json({ error: 'This category already exists' });
    }

    const newCategory = await category.update(req.body);

    return res.json(newCategory);
  }

  async delete(req, res) {
    const category = await Category.findByPk(req.query.movimentId);

    if (!category) {
      return res.status(404).json({ error: 'This category does not exists ' });
    }

    if (category.user_id !== req.userId) {
      return res
        .status(400)
        .json({ error: 'You do not have permission for this category' });
    }

    await category.destroy();

    return res.json({ ok: `The category ${category.name} was deleted` });
  }
}

export default new CategoryController();
