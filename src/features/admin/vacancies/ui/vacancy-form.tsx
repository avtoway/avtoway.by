"use client";

import FieldError from "@/shared/ui/field-error";
import type { Vacancy } from "@/entities/vacancy/vacancy";

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-red-500";

const labelClass = "flex flex-col gap-1";
const labelText = "text-xs font-medium text-slate-400";

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <label className={labelClass}>
      <span className={labelText}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputClass} ${error ? "border-red-500" : ""} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      />
      <FieldError error={error} />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className={labelClass}>
      <span className={labelText}>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass} resize-y`}
      />
      {hint && <span className="text-[10px] leading-relaxed text-slate-600">{hint}</span>}
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className={labelClass}>
      <span className={labelText}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-slate-800 p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</legend>
      {description && <p className="mb-4 text-[11px] leading-relaxed text-slate-500">{description}</p>}
      <div className="grid gap-4">{children}</div>
    </fieldset>
  );
}

export default function VacancyForm({
  form,
  onChange,
  editing,
  errors,
}: {
  form: Vacancy;
  onChange: (field: string, value: unknown) => void;
  editing: boolean;
  errors?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Section title="Основное" description="Название и slug видны в ссылке, меню и поиске. Slug после создания лучше не менять.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Название вакансии *"
            value={form.title}
            onChange={(value) => onChange("title", value)}
            placeholder="Например, мастер-приёмщик автосервиса"
            error={errors?.title}
          />
          <TextInput
            label="Slug *"
            value={form.slug}
            onChange={(value) => onChange("slug", value)}
            placeholder="master-priyomnschik"
            error={errors?.slug}
            disabled={editing}
          />
          <TextInput
            label="Отдел / направление"
            value={form.department ?? ""}
            onChange={(value) => onChange("department", value)}
            placeholder="Сервис, продажи, логистика"
          />
          <TextInput
            label="Город"
            value={form.location}
            onChange={(value) => onChange("location", value)}
            placeholder="Минск"
          />
          <Select
            label="Тип занятости"
            value={form.employmentType}
            onChange={(value) => onChange("employmentType", value)}
            options={[
              { value: "full_time", label: "Полная занятость" },
              { value: "part_time", label: "Частичная занятость" },
              { value: "contract", label: "Контракт" },
              { value: "temporary", label: "Временная работа" },
              { value: "internship", label: "Стажировка" },
            ]}
          />
          <Select
            label="Формат работы"
            value={form.workFormat ?? ""}
            onChange={(value) => onChange("workFormat", value)}
            options={[
              { value: "", label: "Не указан" },
              { value: "office", label: "В офисе" },
              { value: "hybrid", label: "Гибрид" },
              { value: "remote", label: "Удалённо" },
            ]}
          />
          <TextInput
            label="Опыт"
            value={form.experience ?? ""}
            onChange={(value) => onChange("experience", value)}
            placeholder="Без опыта / от 1 года / от 3 лет"
          />
          <TextInput
            label="График"
            value={form.schedule ?? ""}
            onChange={(value) => onChange("schedule", value)}
            placeholder="5/2, 9:00–18:00"
          />
        </div>
      </Section>

      <Section title="Зарплата" description="Можно указать вилку, только «от» или только «до». Если оставить пустым — на сайте будет «по результатам собеседования».">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <label className={labelClass}>
            <span className={labelText}>От</span>
            <input
              type="number"
              min={0}
              value={form.salaryFrom ?? ""}
              onChange={(event) => onChange("salaryFrom", event.target.value === "" ? null : Number(event.target.value))}
              placeholder="2500"
              className={inputClass}
            />
            <FieldError error={errors?.salaryFrom} />
          </label>
          <label className={labelClass}>
            <span className={labelText}>До</span>
            <input
              type="number"
              min={0}
              value={form.salaryTo ?? ""}
              onChange={(event) => onChange("salaryTo", event.target.value === "" ? null : Number(event.target.value))}
              placeholder="4000"
              className={inputClass}
            />
            <FieldError error={errors?.salaryTo} />
          </label>
          <TextInput
            label="Валюта"
            value={form.salaryCurrency}
            onChange={(value) => onChange("salaryCurrency", value)}
            placeholder="BYN"
          />
          <Select
            label="Период"
            value={form.salaryPeriod}
            onChange={(value) => onChange("salaryPeriod", value)}
            options={[
              { value: "month", label: "В месяц" },
              { value: "hour", label: "В час" },
              { value: "shift", label: "За смену" },
              { value: "project", label: "За проект" },
            ]}
          />
        </div>
      </Section>

      <Section title="Описание" description="Короткое описание показывается в карточке. Полное — на странице вакансии.">
        <TextArea
          label="Короткое описание *"
          value={form.shortDescription}
          onChange={(value) => onChange("shortDescription", value)}
          placeholder="Что за роль, чем предстоит заниматься и почему это интересно"
          rows={3}
        />
        <TextArea
          label="О вакансии"
          value={form.description ?? ""}
          onChange={(value) => onChange("description", value)}
          placeholder="Расскажите о команде, задачах и том, как выглядит рабочий день"
          rows={5}
        />
      </Section>

      <Section title="Задачи, требования и условия" description="Каждый пункт — с новой строки. На сайте они автоматически превратятся в списки.">
        <TextArea
          label="Чем предстоит заниматься"
          value={form.responsibilities ?? ""}
          onChange={(value) => onChange("responsibilities", value)}
          placeholder={"Принимать автомобили и согласовывать работы\nВести заказ-наряды\nОбщаться с клиентами"}
          hint="Например: 4–6 пунктов — достаточно, чтобы кандидат понял задачу."
        />
        <TextArea
          label="Что мы ждём"
          value={form.requirements ?? ""}
          onChange={(value) => onChange("requirements", value)}
          placeholder={"Опыт работы в автосервисе\nЗнание устройства автомобиля\nАккуратность и ответственность"}
          hint="Если опыт не обязателен — так и напишите, это расширит отклик."
        />
        <TextArea
          label="Условия и преимущества"
          value={form.conditions ?? ""}
          onChange={(value) => onChange("conditions", value)}
          placeholder={"Оформление по ТК\nОбучение за счёт компании\nСкидки на сервис"}
          hint="Условия, график, обучение, техника, бонусы — всё, что важно кандидату."
        />
        <TextArea
          label="Дополнительные бонусы"
          value={form.benefits ?? ""}
          onChange={(value) => onChange("benefits", value)}
          placeholder={"Корпоративная связь\nПарковка\nКурсы повышения квалификации"}
          hint="Можно оставить пустым, если всё уже описано в условиях."
        />
      </Section>

      <Section title="Контакты для отклика" description="Если не заполнить — на странице будут контакты компании из раздела «Контакты».">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Контактное лицо"
            value={form.contactName ?? ""}
            onChange={(value) => onChange("contactName", value)}
            placeholder="Виктор, руководитель сервиса"
          />
          <TextInput
            label="Телефон"
            value={form.contactPhone ?? ""}
            onChange={(value) => onChange("contactPhone", value)}
            placeholder="+375 (29) 000-00-00"
          />
          <TextInput
            label="Email"
            value={form.contactEmail ?? ""}
            onChange={(value) => onChange("contactEmail", value)}
            placeholder="job@avtoway.by"
            error={errors?.contactEmail}
          />
          <TextInput
            label="Telegram"
            value={form.contactTelegram ?? ""}
            onChange={(value) => onChange("contactTelegram", value)}
            placeholder="https://t.me/..."
          />
        </div>
      </Section>

      <Section title="Публикация" description="Скрытая вакансия остаётся в админке, но не показывается на сайте и не попадает в sitemap.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextInput
            label="Дата публикации"
            type="date"
            value={form.publishedAt ? form.publishedAt.slice(0, 10) : ""}
            onChange={(value) => onChange("publishedAt", value)}
          />
          <label className={labelClass}>
            <span className={labelText}>Порядок вывода</span>
            <input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(event) => onChange("sortOrder", Number(event.target.value))}
              className={inputClass}
            />
            <FieldError error={errors?.sortOrder} />
          </label>
          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => onChange("isActive", event.target.checked)}
                className="h-4 w-4 accent-red-600"
              />
              Показывать на сайте
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => onChange("isFeatured", event.target.checked)}
                className="h-4 w-4 accent-red-600"
              />
              Срочная вакансия
            </label>
          </div>
        </div>
      </Section>
    </div>
  );
}
