import db from '../models/index.js';

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management
 */

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new Student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created
 */
export const createStudent = async (req, res) => {
    try {
        const student = await db.Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortby
 *         schema:
 *           type: string
 *           enum: [Name, DescName, CreatedAt, DescCreatedAt]
 *         description: Sort by field (prefix with 'Desc' for descending)
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           example: course, teacher
 *         description: Include related models (course, teacher)
 *     responses:
 *       200:
 *         description: List of students
 */

export const getAllStudents = async (req, res) => {

    const limit = parseInt(req.query.limit) || 10;

    const page = parseInt(req.query.page) || 1;

    const total = await db.Student.count();

    // sorting
    let sortby = req.query.sortby || 'name';
    let sortField = sortby;
    let sortOrder = 'ASC';

    if (sortby.startsWith('Desc')) {
        sortField = sortby.substring(4);
        sortOrder = 'DESC';
    }

    //populate
    const populate = req.query.populate?.toLowerCase().split(',').map(p => p.trim()) || [];
    const include = [];

    if (populate.includes('courses') || populate.includes('course')) {
        const courseInclude = {
            model: db.Course,
            through: { attributes: [] },
        };

        if (populate.includes('teacher')) {
            courseInclude.include = [{ model: db.Teacher}];
        }

        include.push(courseInclude);
    }

    try {
        const students = await db.Student.findAll({
            limit: limit, 
            offset: (page - 1) * limit, 
            order: [[sortField, sortOrder]],
            include: include,
        });
        res.json({
            meta: {
                totalItems: total,
                page: page,
                totalPages: Math.ceil(total / limit),
            },
            data: students,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           example: course, teacher
 *         description: Include related models (course, teacher)
 *     responses:
 *       200:
 *         description: A student
 *       404:
 *         description: Not found
 */
export const getStudentById = async (req, res) => {

    const populate = req.query.populate?.toLowerCase().split(',').map(p => p.trim()) || [];
    const include = [];

    if (populate.includes('courses') || populate.includes('course')) {
        const courseInclude = {
            model: db.Course,
            through: { attributes: [] },
        };

        if (populate.includes('teacher')) {
            courseInclude.include = [{ model: db.Teacher}];
        }

        include.push(courseInclude);
    }

    try {
        const student = await db.Student.findByPk(req.params.id, { include});
        if (!student) return res.status(404).json({ message: 'Not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Updated
 */
export const updateStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.update(req.body);
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
export const deleteStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
