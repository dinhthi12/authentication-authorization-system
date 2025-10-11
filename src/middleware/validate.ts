import { ZodSchema } from 'zod'
import { Request, Response, NextFunction } from 'express'

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    const messages = result.error.issues.map((e) => e.message).join(', ')
    return res.status(400).json({
      success: false,
      message: messages
    })
  }

  next()
}
