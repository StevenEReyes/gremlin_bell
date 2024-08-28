class PostsController < ApplicationController
  before_action :authenticate_user!

  def new
    @post = Post.new
    authorize @post
  end
  def create
    @post = Post.new(post_params)
    @post.user = current_user
    @post.tags = params[:post][:tags].split(',').map(&:strip) if params[:post][:tags].present?
    @post.content = process_mentions(@post.content)
    authorize @post
    Rails.logger.debug { @post.inspect }

    if @post.save
      redirect_to root_path
    else
      flash[:alert] = "Não foi possível postar o comentário. Por favor, tente novamente."
    end
  end

  def update
    @post = Post.find(params[:id])
    @post.tags = process_tags(params[:post][:tags])
    
    if @post.update(post_params)
      redirect_to @post, notice: 'Post was successfully updated.'
    else
      render :edit
    end
  end

  def index
    @posts = policy_scope(Post)
                .where(user_id: current_user.following.pluck(:id) + [current_user.id])
                .order(created_at: :desc)
                .to_a
  end
  

  def show
    @post = Post.find(params[:id])
    @comment = Comment.new
    @comments = @post.comments
  end

  def search
    if params[:tag]
      @posts = Post.where("tags @> ARRAY[?]::varchar[]", params[:tag])
    else
      @posts = Post.all
    end
    authorize @posts
  end

  # def like
  #   @post = Post.find(params[:id])
  #   authorize @post
  #   current_user.favorite(@post)
  #   # @post.update_likes_count
  #   redirect_to posts_path, notice: "Post liked."
  # end

  # def unlike
  #   @post = Post.find(params[:id])
  #   authorize @post
  #   current_user.unfavorite(@post)
  #   # @post.update_likes_count
  #   redirect_to posts_path, notice: "Post unliked."
  # end
  

  private
  
  def process_mentions(content)
    mentions = []
  
    processed_content = content.gsub(/@(\w+)/) do |mention|
      user = User.find_by(username: $1)
  
      if user
        mentions << user.username
        "<a href='#{user_path(user)}'>@#{user.username}</a>"
      else
        mention
      end
    end
  
    @post.mentions = mentions if @post.respond_to?(:mentions)
    processed_content
  end
  
  def process_tags(tags_string)
    tags_string.split(',').map { |tag| tag.strip.downcase.gsub(/\s+/, '-') }
  end  

  def post_params
    params.require(:post).permit(
      :title, 
      :content, 
      :visibility, 
      :image_url, 
      :location, 
      :status, 
      :media_url, 
      :parent_post_id, 
      :likes_count, 
      :comments_count,
      tags: [], 
      mentions: [],
      images: []
    )
  end  
end
