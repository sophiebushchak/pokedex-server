import express from "express";
import HelloController from "../controllers/HelloController";

const router = express.Router()

const controller = new HelloController()

router.get('/hello', controller.hello)

export default router