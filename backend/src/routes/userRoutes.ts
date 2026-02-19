import { Router } from "express";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
} from "../controllers/userController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate);

router.get("/", listUsers);
router.get("/:id", getUser);

router.post("/", authorize("ADMIN", "SUPER_ADMIN"), createUser);

router.put("/:id", authorize("ADMIN", "SUPER_ADMIN"), updateUser);

router.delete("/:id", authorize("SUPER_ADMIN"), deleteUser);

export default router;
