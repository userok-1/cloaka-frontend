import { z } from 'zod';
import { TFunction } from 'i18next';

export const createLoginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t('validation.emailRequired'))
      .email(t('validation.emailInvalid')),
    password: z
      .string()
      .min(1, t('validation.passwordRequired'))
      .min(8, t('validation.passwordMin')),
  });

export const createRegisterSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, t('validation.nameRequired'))
      .min(2, t('validation.nameMin'))
      .max(100),
    email: z
      .string()
      .min(1, t('validation.emailRequired'))
      .email(t('validation.emailInvalid')),
    password: z
      .string()
      .min(1, t('validation.passwordRequired'))
      .min(8, t('validation.passwordMin'))
      .regex(/[a-zA-Z]/, t('validation.passwordLetter'))
      .regex(/\d/, t('validation.passwordDigit')),
  });

export const createUpdateProfileSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .max(100)
      .refine((s) => s.trim() === '' || s.trim().length >= 2, t('validation.nameMin')),
    email: z
      .string()
      .min(1, t('validation.emailRequired'))
      .email(t('validation.emailInvalid'))
      .max(150),
  });

export const createChangePasswordFormSchema = (t: TFunction) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, t('validation.currentPasswordRequired'))
        .min(8, t('validation.passwordMin')),
      newPassword: z
        .string()
        .min(1, t('validation.passwordRequired'))
        .min(8, t('validation.passwordMin'))
        .regex(/[a-zA-Z]/, t('validation.passwordLetter'))
        .regex(/\d/, t('validation.passwordDigit')),
      confirmPassword: z.string().min(1, t('validation.confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.passwordsMustMatch'),
      path: ['confirmPassword'],
    });
