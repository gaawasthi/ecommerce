// jwt 

a json web token is like a digital id 

when you log in the server gives you a token (like a singled note)
you send that note back with every reques so the sever knows it u

// if you dont set an expire the token never expires 
// way to use access token expires in 15 minutes 
// refresh token expires in 7 days

why we need referh token 

getting a new access token when old one expires 
on logout the server deletes or blocks the referesh token so no one can reuse it 

// best practices

always set expiration time 
use diffenent secrets for access and referesh token 
store access token in memory 
and refersh token in HTTPS_only cookie 
always use HTTps 
refresh tokens should be rotated (new one each tome )


// let accessToken = response.data.accessToken
// refresh in HTTP only 

// sanitize mongo sanitize
