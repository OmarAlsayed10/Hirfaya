import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prisma";
import { normalizeEmail } from "../lib/normalizeEmail";

const withValidationErrors = (validationRules: any[]) => {
  return [
    ...validationRules,
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ errors: errorMessages });
      }
      next();
    },
  ];
};

export const validateRegisterInput = withValidationErrors([
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const user = await prisma.user.findUnique({
        where: { email: normalizeEmail(email) },
      });
      if (user) {
        throw new Error("Email already exists");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
]);

export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
]);