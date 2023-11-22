import axios_instance from "../index";

export const getBoards = (boardID: number) => axios_instance.get(`/boards/${boardID}`);

// export const addPost = (newPost) =>
//   axios_instance.post(`/posts`, {
//     title: newPost.title,
//     body: newPost.body,
//     userId: newPost.userId,
//   });


// export const updatePost = (updatedPost) => {
//     axios_instance.put(`/posts/${updatedPost._id}?userId=${updatedPost.userId}`, {
//       title: updatedPost.title,
//       body: updatedPost.body,
//     })
// }


//   export const deletePost = (postId, userId) => {
//     axios_instance.delete(`/posts/${postId}?userId=${userId}`)
//   }