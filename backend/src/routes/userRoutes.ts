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
import { ROLES } from "../utils/constants";

const router = Router();

router.use(authenticate);

router.get("/", listUsers);
router.get("/:id", getUser);

router.post("/", authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), createUser);

router.put("/:id", authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), updateUser);

router.delete("/:id", authorize(ROLES.SUPER_ADMIN), deleteUser);

export default router;
