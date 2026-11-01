'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
const form = document.getElementById('brief');
const messages = {
  en: { sending: 'Sending…', success: 'Thank you. Your inquiry has been submitted successfully.', error: 'Your inquiry could not be confirmed. Please try again later. Your entries have been kept.', invalid: 'Please check the required fields and enter a valid email address.' },
  zh: { sending: '正在提交……', success: '感谢您的咨询，您的信息已成功提交。', error: '暂时无法确认您的咨询是否已提交，请稍后重试。您填写的内容已保留。', invalid: '请检查必填项，并输入有效的电子邮箱地址。' },
  de: { sending: 'Wird gesendet …', success: 'Vielen Dank. Ihre Anfrage wurde erfolgreich übermittelt.', error: 'Die Übermittlung Ihrer Anfrage konnte nicht bestätigt werden. Bitte versuchen Sie es später erneut. Ihre Eingaben bleiben erhalten.', invalid: 'Bitte prüfen Sie die Pflichtfelder und geben Sie eine gültige E-Mail-Adresse ein.' }
};
const copy = messages[form.dataset.language] || messages.en;
const status = document.getElementById('status');
const button = form.querySelector('button[type="submit"]');
let submitting = false;
form.addEventListener('submit', async function (event) {
  event.preventDefault();
  if (submitting) return;
  if (!form.checkValidity()) { status.textContent = copy.invalid; form.reportValidity(); return; }
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
