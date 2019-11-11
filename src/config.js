export default {
  apiUrl:
    process.env.NODE_ENV === "production"
      ? "http://ec2-3-8-216-213.eu-west-2.compute.amazonaws.com/api"
      : "http://localhost:3000"
};
