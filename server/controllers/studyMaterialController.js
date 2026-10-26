const StudyMaterial = require('../models/StudyMaterial');
const fs = require('fs');
const path = require('path');
const { paginate, buildFilter } = require('../utils/helpers');

const populateFields = [
  { path: 'subject', select: 'name code' },
  { path: 'class', select: 'name' },
  { path: 'section', select: 'name' },
  { path: 'teacher', select: 'teacherId' },
  { path: 'uploadedBy', select: 'name' },
];

const getMaterials = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['class', 'subject', 'section', 'teacher', 'isActive']);

    const [materials, total] = await Promise.all([
      StudyMaterial.find(filter).populate(populateFields).skip(skip).limit(pageLimit).sort({ createdAt: -1 }),
      StudyMaterial.countDocuments(filter),
    ]);

    res.json({
      materials,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id).populate(populateFields);
    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }
    res.json({ material });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createMaterial = async (req, res, next) => {
  try {
    const { title, description, subject, class: classId, teacher, section } = req.body;

    const materialData = {
      title,
      description,
      subject,
      class: classId,
      teacher,
      section,
      uploadedBy: req.user.id,
    };

    if (req.file) {
      materialData.fileUrl = req.file.path;
      materialData.fileType = req.file.mimetype;
      materialData.fileSize = req.file.size;
    }

    const material = await StudyMaterial.create(materialData);

    const populated = await StudyMaterial.findById(material._id).populate(populateFields);

    res.status(201).json({ material: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateMaterial = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    ).populate(populateFields);

    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }

    res.json({ material });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }

    if (material.fileUrl) {
      fs.unlink(material.fileUrl, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting file:', err);
        }
      });
    }

    await StudyMaterial.findByIdAndDelete(req.params.id);

    res.json({ message: 'Study material deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMaterialsByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const materials = await StudyMaterial.find({ class: classId, isActive: true })
      .populate(populateFields)
      .sort({ createdAt: -1 });

    res.json({ materials });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMaterials, getMaterial, createMaterial, updateMaterial, deleteMaterial, getMaterialsByClass };
