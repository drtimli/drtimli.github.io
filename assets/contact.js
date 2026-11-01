'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
const form = document.getElementById('brief');
const messages = {
  en: { sending: 'Sending…', success: 'Thank you. Your inquiry has been submitted successfully.', error: 'Your inquiry could not be confirmed. Please try again later. Your entries have been kept.', invalid: 'Please correct the highlighted fields before sending.', required: { name: 'Enter your name.', email: 'Enter your email address.', company: 'Enter your company name.', challenge: 'Enter your inquiry.' }, email: 'Enter a valid email address, such as you@company.com.', tooLong: 'Use no more than {max} characters.' },
  zh: { sending: '正在提交……', success: '感谢您的咨询，您的信息已成功提交。', error: '暂时无法确认您的咨询是否已提交，请稍后重试。您填写的内容已保留。', invalid: '请修改标出的内容后再发送。', required: { name: '请输入姓名。', email: '请输入电子邮箱。', company: '请输入公司名称。', challenge: '请输入咨询内容。' }, email: '请输入有效的电子邮箱，例如 you@company.com。', tooLong: '请勿超过 {max} 个字符。' },
  de: { sending: 'Wird gesendet …', success: 'Vielen Dank. Ihre Anfrage wurde erfolgreich übermittelt.', error: 'Die Übermittlung Ihrer Anfrage konnte nicht bestätigt werden. Bitte versuchen Sie es später erneut. Ihre Eingaben bleiben erhalten.', invalid: 'Bitte korrigieren Sie die markierten Felder vor dem Senden.', required: { name: 'Bitte geben Sie Ihren Namen ein.', email: 'Bitte geben Sie Ihre E-Mail-Adresse ein.', company: 'Bitte geben Sie Ihren Unternehmensnamen ein.', challenge: 'Bitte geben Sie Ihre Anfrage ein.' }, email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel sie@unternehmen.de.', tooLong: 'Bitte verwenden Sie höchstens {max} Zeichen.' }
};
const copy = messages[form.dataset.language] || messages.en;
const status = document.getElementById('status');
const button = form.querySelector('button[type="submit"]');
const fields = ['name', 'email', 'company', 'challenge'].map(id => document.getElementById(id));

function validationError(field) {
  if (!field.value.trim()) return copy.required[field.id];
  if (field.maxLength > 0 && field.value.length > field.maxLength) {
    return copy.tooLong.replace('{max}', field.maxLength);
  }
  if (field.id === 'email' && field.validity.typeMismatch) return copy.email;
  return field.checkValidity() ? '' : copy.invalid;
}

function validateField(field) {
  const error = validationError(field);
  const hint = document.getElementById(field.id + '-error');
  hint.textContent = error;
  hint.hidden = !error;
  if (error) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
  return !error;
}

fields.forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    if (status.textContent === copy.invalid && fields.every(field => !validationError(field))) {
      status.textContent = '';
    }
  });
});
// Use localized inline feedback when JavaScript is available. HTML required/type
// constraints still provide native validation if JavaScript is unavailable.
form.noValidate = true;
let submitting = false;
form.addEventListener('submit', async function (event) {
  event.preventDefault();
  if (submitting) return;
  fields.forEach(field => { field.value = field.value.trim(); });
  const invalidFields = fields.filter(field => !validateField(field));
  if (invalidFields.length) {
    status.textContent = copy.invalid;
    invalidFields[0].focus();
    return;
  }
  submitting = true;
  button.disabled = true;
  form.setAttribute('aria-busy', 'true');
  const originalLabel = button.textContent;
  button.textContent = copy.sending;
  status.textContent = copy.sending;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(form.action, {
      method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal
    });
    if (!response.ok) throw new Error('Submission not accepted');
    status.textContent = copy.success;
    form.reset();
  } catch (error) {
    status.textContent = copy.error;
  } finally {
    clearTimeout(timeout);
    submitting = false;
    button.disabled = false;
    button.textContent = originalLabel;
    form.removeAttribute('aria-busy');
  }
});
