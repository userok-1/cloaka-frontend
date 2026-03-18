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
