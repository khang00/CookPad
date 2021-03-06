/* eslint no-new: 1 */
import database from '@/plugins/database.js'
import storage from '@/plugins/firestore.js'

const collection = 'users'
export const usersDB = database.collection(collection)
const userStorePath = 'user/'
const defaultPhoto =
  'https://firebasestorage.googleapis.com/v0/b/cookpad-blog.appspot.com/o/user%2Fdefault.jpg?alt=media&token=865f142c-99fb-4255-9b9d-a1d2682abd42'

export const infoModel = {
  uid: '',
  displayName: '',
  email: '',
  photoUrl: defaultPhoto,
  phone: '',
  bio: ''
}

function computePosts(userCollSnapshot) {
  return new Promise((resolve, reject) => {
    const postsArr = []
    userCollSnapshot.ref
      .collection('posts')
      .get()
      .then((posts) => {
        posts.forEach((document) => {
          const postObject = { ...document.data() }
          postObject.id = document.id
          postsArr.push(postObject)
        })
        resolve(postsArr)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function computeFollwers(userCollSnapshot) {
  return new Promise((resolve, reject) => {
    const followersArr = []
    userCollSnapshot.ref
      .collection('followers')
      .get()
      .then((followers) => {
        followers.forEach((document) => {
          followersArr.push(document.data())
        })
        resolve(followersArr)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function computeFollowings(userCollSnapshot) {
  return new Promise((resolve, reject) => {
    const followingsArr = []
    userCollSnapshot.ref
      .collection('following')
      .get()
      .then((followings) => {
        followings.forEach((document) => {
          followingsArr.push(document.data())
        })
        resolve(followingsArr)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export function getInfo(userId) {
  return new Promise((resolve, reject) => {
    let userInfo = {}
    usersDB
      .doc(userId)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          userInfo = snapshot.data()
          computeFollwers(snapshot).then((followersArr) => {
            userInfo.followers = followersArr
            computeFollowings(snapshot).then((followingsArr) => {
              userInfo.followings = followingsArr
              computePosts(snapshot).then((postsArr) => {
                userInfo.posts = postsArr
                resolve(userInfo)
              })
            })
          })
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        reject(err)
      })
  })
}

let allPost = []

export function retriveAllPost() {
  return new Promise((resolve, reject) => {
    allPost = []
    usersDB.get().then((userSnapshots) => {
      userSnapshots.forEach((userSnapshot) => {
        userSnapshot.ref
          .collection('posts')
          .get()
          .then((postSnapshots) => {
            postSnapshots.forEach((postSnapshot) => {
              allPost.push(postSnapshot.data())
            })
            resolve(allPost)
          })
      })
    })
  })
}

export function getUsers() {
  return new Promise((resolve, reject) => {
    usersDB
      .get()
      .then((userSnapshots) => {
        const users = []
        userSnapshots.forEach((snapshot) => {
          users.push(snapshot.data())
          resolve(users)
        })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export function getUrlPhotoImage(userId) {
  return storage.child(`${userStorePath}/${userId}.jpg`).getDownloadURL()
}

export function updatePhotoImage(userId, image) {
  return storage.child(`${userStorePath}/${userId}.jpg`).put(image)
}

export function getInfoByEmail(email) {
  return usersDB.where('email', '==', email).get()
}

export function getInfoByDisplayName(displayName) {
  return usersDB.where('displayName', '==', displayName).get()
}

export function setInfo(userId, info) {
  return usersDB.doc(userId).set(info)
}

export function updateInfo(userId, info) {
  return usersDB.doc(userId).update(info)
}
