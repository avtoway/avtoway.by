"use client";

import { useState, useCallback } from "react";
import type { ZodSchema, ZodError } from "zod";

type Errors = Record<string, string>;

function parseErrors(error: ZodError): Errors {
  const map: Errors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}

export function useFormValidation<T extends Record<string, unknown>>(
  schema: ZodSchema<T>,
  initial: T,
) {
  const [form, setForm] = useState<T>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const setField = useCallback((field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => new Set(prev).add(field));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateField = useCallback((field: string, value: unknown) => {
    const result = schema.safeParse({ ...form, [field]: value });
    if (result.success) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    } else {
      const issue = result.error.issues.find(i => i.path[0] === field || i.path.join(".") === field);
      setErrors(prev => {
        const next = { ...prev };
        if (issue) next[field] = issue.message;
        else delete next[field];
        return next;
      });
    }
    setTouched(prev => new Set(prev).add(field));
  }, [schema, form]);

  const validateAll = useCallback((): boolean => {
    const result = schema.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    setErrors(parseErrors(result.error));
    setTouched(new Set(Object.keys(form)));
    return false;
  }, [schema, form]);

  const resetForm = useCallback((newForm?: T) => {
    setForm(newForm ?? initial);
    setErrors({});
    setTouched(new Set());
  }, [initial]);

  return {
    form, setForm, setField,
    errors, setErrors,
    touched, setTouched, validateField, validateAll,
    resetForm,
  };
}
