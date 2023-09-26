const express = require("express")
const router = express.Router()
const {create,getAllblogs,singleBlog,remove,update} = require("../controllers/blogcontroller")

router.post('/create',create)
router.get('/blogs',getAllblogs)
router.get('/blog/:slug',singleBlog)
router.delete('/blog/:slug',remove)
router.put('/blog/:slug',update)

module.exports = router