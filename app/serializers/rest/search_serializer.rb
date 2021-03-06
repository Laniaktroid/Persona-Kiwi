# frozen_string_literal: true

class REST::SearchSerializer < ActiveModel::Serializer

  has_many :accounts, serializer: REST::AccountSerializer
  has_many :statuses, serializer: REST::StatusSerializer
  has_many :groups, serializer: REST::GroupSerializer
  has_many :links, serializer: REST::PreviewCardSerializer
  has_many :hashtags, serializer: REST::TagSerializer

end
