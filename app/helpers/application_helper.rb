module ApplicationHelper
  def is_active?(controller: '', path: '')
    params[:controller].in?(Array(controller)) || (path.is_a?(Regexp) ? (path =~ request.path) : (path == request.path))
  end
end
