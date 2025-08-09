import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../middleware/auth.js';
import Prescription from '../models/Prescription.js';

const r = express.Router();
const storage = multer.diskStorage({
  destination:(_,__,cb)=>cb(null,'uploads'),
  filename:(_,file,cb)=>cb(null,Date.now()+'_'+file.originalname.replace(/\s+/g,'_'))
});
const upload = multer({storage});

/* POST /api/prescriptions  (file+remark) */
r.post('/', requireAuth, upload.single('file'), async(req,res)=>{
  const doc = await Prescription.create({
    userId:req.user.id,
    filename:req.file.filename,
    original:req.file.originalname,
    remark:req.body.remark||''
  });
  res.json(doc);
});

/* GET /api/prescriptions */
r.get('/', requireAuth, async (req,res)=>{
  const rows = await Prescription.find({userId:req.user.id}).sort({uploadedAt:-1});
  res.json(rows);
});
export default r;
