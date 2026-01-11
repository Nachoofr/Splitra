package com.intern.splitra.constant;

import org.springframework.stereotype.Component;


public class UserApiEndpointConstants {
    public static final String SPLITRA = "/splitra";
    public static final String USERS = SPLITRA + "/users";
    public static final String LOGIN =  USERS + "/login";
    public static final String SIGN_UP = USERS + "/signup";
    public static final String USER_ID = USERS + "/{id}";
}
