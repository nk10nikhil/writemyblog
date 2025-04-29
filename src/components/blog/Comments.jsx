'use client';

import { useState } from 'react';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';

export default function Comments({ comments = [], blogId, blogAuthorId }) {
    const [localComments, setLocalComments] = useState(comments);

    // Group comments by their parent
    const commentsByParent = localComments.reduce((acc, comment) => {
        const parentId = comment.parentId || 'root';
        if (!acc[parentId]) {
            acc[parentId] = [];
        }
        acc[parentId].push(comment);
        return acc;
    }, {});

    // Root comments are those without a parent
    const rootComments = commentsByParent.root || [];

    // Sort comments by date (newest first)
    const sortedRootComments = [...rootComments].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Function to render comments recursively
    const renderComments = (parentId) => {
        const childComments = commentsByParent[parentId] || [];

        return childComments.map((comment) => (
            <div key={comment._id} className="mb-4">
                <CommentCard
                    comment={comment}
                    blogId={blogId}
                    blogAuthorId={blogAuthorId}
                    onReplySuccess={handleCommentAdded}
                    onDelete={handleCommentDeleted}
                />
                {commentsByParent[comment._id] && (
                    <div className="ml-8 mt-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                        {renderComments(comment._id)}
                    </div>
                )}
            </div>
        ));
    };

    const handleCommentAdded = (newComment) => {
        setLocalComments(prev => [...prev, newComment]);
    };

    const handleCommentDeleted = (commentId) => {
        // Recursively find and remove the comment and its replies
        const removeCommentAndReplies = (id) => {
            // Get replies to this comment
            const replies = commentsByParent[id] || [];
            const replyIds = replies.map(reply => reply._id);

            // Recursively remove all replies
            replyIds.forEach(replyId => {
                removeCommentAndReplies(replyId);
            });

            // Remove this comment
            setLocalComments(prev => prev.filter(c => c._id !== id));
        };

        removeCommentAndReplies(commentId);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold mb-6">
                    Comments ({localComments.length})
                </h2>

                <div className="mb-8">
                    <CommentForm
                        blogId={blogId}
                        onSuccess={handleCommentAdded}
                        placeholder="Share your thoughts about this post..."
                    />
                </div>

                {sortedRootComments.length > 0 ? (
                    <div className="space-y-6">
                        {renderComments('root')}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">
                            No comments yet. Be the first to share your thoughts!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}