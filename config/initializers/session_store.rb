# Be sure to restart your server when you modify this file.

Rails.application.config.session_store :cookie_store,
  key: '_gabsocial_session',
  secure: (Rails.env.production? || ENV['LOCAL_HTTPS'] == 'true'),
  expire_after: 24.hours, 
  same_site: :lax
