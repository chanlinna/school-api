import db from '../models/index.js';

/**
 * @swagger
 * tags:
 *   - name: Teachers
 *     description: Teacher management
 */

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, department]
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher created
 */
export const createTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.create(req.body);
        res.status(201).json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teachers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
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
 *           example: course, student
 *         description: Include related models (course, student)
 *     responses:
 *       200:
 *         description: List of teachers
 */
export const getAllTeachers = async (req, res) => {

    const limit = parseInt(req.query.limit) || 10;

    const page = parseInt(req.query.page)  || 1;

    const total = await db.Teacher.count();

    //sorting
    let sortby =req.query.sortby || 'name';
    let sortField = sortby;
    let sortOrder = 'ASC';
    
    //populate
    const populate = req.query.populate?.toLowerCase().split(',').map( p => p.trim()) || [];

    const include = [];

    if (populate.includes('courses') || populate.includes('course')) {
        const courseInclude = {
            model: db.Course,
        };

        //optionally populate students in course
        if(populate.includes('students') || populate.includes('student')) {
            courseInclude.include = [{
                model: db.Student,
                through: { attributes: [] },
            }];
        }

        include.push(courseInclude);
    }

    if (sortby.startsWith('Desc')) {
        sortField = sortby.substring(4);
        sortOrder = 'DESC';
    }

    try {
        const teachers = await db.Teacher.findAll({ 
            limit: limit, 
            offset: (page - 1) * limit, 
            order: [[sortField, sortOrder]],
            include: include,
        });
        res.json({
            meta: {
                totalItem: total,
                page: page,
                totalPages: Math.ceil(total / limit),
            },
            data: teachers,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Get a teacher by ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           example: course, student
 *         description: Include related models (course, student)
 *     responses:
 *       200:
 *         description: Teacher found
 *       404:
 *         description: Not found
 */
export const getTeacherById = async (req, res) => {

    const populate = req.query.populate?.toLowerCase().split(',').map( p => p.trim()) || [];

    const include = [];

    if (populate.includes('courses') || populate.includes('course')) {
        const courseInclude = {
            model: db.Course,
        };

        //optionally populate students in course
        if(populate.includes('students') || populate.includes('student')) {
            courseInclude.include = [{
                model: db.Student,
                through: { attributes: [] },
            }];
        }

        include.push(courseInclude);
    }

    try {
        const teacher = await db.Teacher.findByPk(req.params.id, { include});
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update a teacher
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
export const updateTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        await teacher.update(req.body);
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Delete a teacher
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        await teacher.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
