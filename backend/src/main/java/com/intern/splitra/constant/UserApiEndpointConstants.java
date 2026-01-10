package com.intern.splitra.constant;

import org.springframework.stereotype.Component;


public class UserApiEndpointConstants {
    private static final String SPLITRA = "/splitra";
    public static final String USERS = SPLITRA + "/users";
    public static final String LOGIN = SPLITRA + USERS + "/login";
    public static final String SIGN_UP = SPLITRA + USERS + "/signup";
    public static final String USER_ID = SPLITRA + USERS + "/{id}";
}
