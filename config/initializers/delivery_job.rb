ActionMailer::MailDeliveryJob.class_eval do
  discard_on ActiveJob::DeserializationError, Net::SMTPFatalError
end
