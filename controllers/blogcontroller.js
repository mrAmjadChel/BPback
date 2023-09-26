//contact with database
const slugify = require("slugify")
const { v4: uuidv4 } = require('uuid');
const oracleDB = require('../connectToOracleDB');

// สร้างบทความใหม่
exports.create = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    let slug = slugify(title);

    // ตรวจสอบความถูกต้องของข้อมูล
    if (!slug) slug = uuidv4();
    switch (true) {
      case !title:
        return res.status(400).json({ error: 'กรุณาป้อนชื่อบทความ' });
        break;
      case !content:
        return res.status(400).json({ error: 'กรุณาป้อนเนื้อหาบทความ' });
        break;
    }

     // ตรวจสอบความซ้ำของ slug กับบทความที่มีอยู่แล้ว

    const connection = await oracleDB(); // เชื่อมต่อกับ OracleDB
    const checkSlugQuery = 'SELECT slug FROM hr.blogs WHERE slug = :slug';
    const checkSlugResult = await connection.execute(checkSlugQuery, [slug]);
    if (checkSlugResult.rows.length > 0) {
      // มี slug ที่ซ้ำกันอยู่แล้ว
      slug = `${slug}-${uuidv4()}`; // ใช้ UUID สร้าง slug ใหม่
    }

    const query = 'INSERT INTO hr.blogs (title, content, author, slug) VALUES (:title, :content, :author, :slug)';
    const binds = [title, content, author, slug];
    const options = { autoCommit: true };
    await connection.execute(query, binds, options);

    res.json({ message: 'บทความถูกสร้างเรียบร้อย' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างบทความ' });
  }
};

// ดึงข้อมูลบทความทั้งหมด
exports.getAllblogs = async (req, res) => {
  try {
    const connection = await oracleDB(); // เชื่อมต่อกับ OracleDB
    const query = 'SELECT * FROM hr.blogs'; // ตัวอย่างคำสั่ง SQL สำหรับการดึงข้อมูล
    const result = await connection.execute(query);

    const blogs = result.rows;

    // แปลงข้อมูลให้เป็น JSON
    const jsonData = blogs.map(row => {
      return {
        //id: row[0],
        title: row[0],
        content: row[1],
        author: row[2],
        slug: row[3],
        created_at: row[4],
        updated_at: row[5]
      };
    });

    res.json(jsonData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบทความจาก OracleDB' });
  }
};

// ดึงบทความที่สนใจโดยอ้างอิงตาม slug
exports.singleBlog = async (req, res) => {
  try {
    const { slug } = req.params;
    const connection = await oracleDB(); // เชื่อมต่อกับ OracleDB
    const query = 'SELECT * FROM hr.blogs WHERE slug = :slug'; // ตัวอย่างคำสั่ง SQL
    const binds = [slug];
    const result = await connection.execute(query, binds);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบบทความที่ค้นหา' });
    }

    const blogData = {
      title: result.rows[0][0],
      content: result.rows[0][1],
      author: result.rows[0][2],
      slug: result.rows[0][3],
      created_at: result.rows[0][4],
      updated_at: result.rows[0][5]
    };

    res.json(blogData); // ส่งข้อมูลบทความเป็น JSON กลับให้กับลูกค้า
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบทความ' });
  }
};

// ลบบทความ
exports.remove = async (req, res) => {
  try {
    const { slug } = req.params;
    const connection = await oracleDB(); // เชื่อมต่อกับ OracleDB
    const query = 'DELETE FROM hr.blogs WHERE slug = :slug'; // ตัวอย่างคำสั่ง SQL
    const binds = [slug];
    const options = { autoCommit: true };
    const result = await connection.execute(query, binds, options);

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'ไม่พบบทความที่ต้องการลบ' });
    }

    res.json({ message: 'ลบบทความเรียบร้อย' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบบทความ' });
  }
};

// อัปเดตบทความ

exports.update = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, author } = req.body;
    
    // ตรวจสอบความถูกต้องของข้อมูลขาเข้า
    if (!title || !content || !author) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    
    const connection = await oracleDB(); // เชื่อมต่อกับ OracleDB
    const query = 'UPDATE hr.blogs SET title = :title, content = :content, author = :author WHERE slug = :slug';
    const binds = [title, content, author, slug];
    const options = { autoCommit: true };
    const result = await connection.execute(query, binds, options);

    if (result.rowsAffected === 0) {
      // ไม่พบบทความที่ต้องการอัปเดต
      return res.status(404).json({ error: 'ไม่พบบทความที่ต้องการอัปเดต' });
    }

    // ส่งคำตอบเมื่ออัปเดตสำเร็จ
    res.json({ message: 'อัปเดตบทความเรียบร้อย' });
  } catch (error) {
    console.error(error);

    // ส่งคำตอบเมื่อมีข้อผิดพลาดเกิดขึ้น
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตบทความ' });
  }
};