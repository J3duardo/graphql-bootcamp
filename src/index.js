import {GraphQLServer} from "graphql-yoga";
import uuidv4 from "uuid";

//Usuarios de prueba
const users = [
  {
    id: "1",
    name: "Jesús",
    email: "jesus@gmail.com",
    age: 33
  },
  {
    id: "2",
    name: "Keisa",
    email: "keisa@gmail.com",
    age: 33
  },
  {
    id: "3",
    name: "Geraldine",
    email: "geraldine@gmail.com",
    age: 32
  }
]

//Posts de prueba
const posts = [
  {
    id: "1",
    title: "Advanced ReactJS",
    body: "Contenido del post 1",
    published: true,
    author: "2"
  },
  {
    id: "2",
    title: "Learning Backend Web Development",
    body: "Contenido del post 2",
    published: false,
    author: "1"
  },
  {
    id: "3",
    title: "GraphQL from the Ground Up",
    body: "Contenido del post 3",
    published: true,
    author: "2"
  },
]

//Comentarios de prueba
const comments = [
  {
    id: "14",
    postId: "3",
    authorId:"1",
    text: "Excelent post, very useful information."
  },
  {
    id: "26",
    postId: "1",
    authorId:"2",
    text: "This post is really helpful."
  },
  {
    id: "39",
    postId: "2",
    authorId:"3",
    text: "This post is ok, but could be better."
  },
  {
    id: "45",
    postId: "3",
    authorId:"2",
    text: "Good explanations! May be better if adding more on SSR and Security, tho."
  },
]

//Definición de tipos (Schema)
const typeDefs = `
  type Query {
    me: User!
    post: Post!
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments: [Comment!]!
  }

  type Mutation {
    createUser(name: String!, email: String!, age: Int): User!
    createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
    createComment(text: String!, authorId: ID!, postId: ID!): Comment!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    postId: ID!
    authorId: ID!
    author: User!
    text: String!
    post: Post!
  }
`

//Resolvers
const resolvers = {
  Query: {
    me() {
      return {
        id: "17899258",
        name: "Jesús",
        email: "jesus@gmail.com",
        age: "25"
      }
    },
    post() {
      return {
        id: "abcde123456",
        title: "A test post",
        body: "A text of body from the test post",
        published: false
      }
    },
    users(parent, args, ctx, info) {
      if(!args.query) {
        return users
      }
      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    posts(parent, args, ctx, info) {
      if(!args.query) {
        return posts
      }
      return posts.filter((post) => {
        return post.title.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    comments(parent, args, ctx, info) {
      return comments
    }
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some(user => {
        return user.email === args.email
      });

      if(emailTaken) {
        throw new Error("Email already in use")
      }

      const user = {
        id: uuidv4(),
        name: args.name,
        email: args.email,
        age: args.age
      }

      users.push(user);
      return user
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some(user => {
        return user.id === args.author
      });

      if(!userExists) {
        throw new Error("User not found")
      }

      const post = {
        id: uuidv4(),
        title: args.title,
        body: args.body,
        published: args.published,
        author: args.author
      }

      posts.push(post);
      return post
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some(user => {
        return user.id === args.authorId
      });

      const postExists = posts.find(post => {
        return post.id === args.postId
      });

      if(!userExists) {
        throw new Error("User not found")
      }

      if(!postExists) {
        throw new Error("Post not found")
      }

      if(!postExists.published) {
        throw new Error("This post hasn't been published yet")
      }

      const comment = {
        id: uuidv4(),
        postId: args.postId,
        authorId: args.authorId,
        text: args.text
      }

      comments.push(comment);      
      return comment
    }
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author
      })
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.postId === parent.id
      })
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter(post => {
        return post.author === parent.id
      })
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.authorId === parent.id
      })
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.authorId
      })
    },
    post(parent, args, ctx, info) {
      return posts.find(post => {
        return post.id === parent.postId
      })
    }
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start(() => {
  console.log("Server running!")
})