package com.intern.splitra.constant;

public class GroupApiEndpointConstants {
    public static final String SPLITRA = "/splitra";
    public static final String GROUPS = SPLITRA + "/groups";
    public static final String GROUPS_COUNT = GROUPS + "/count";
    public static final String GROUP_ID = GROUPS + "/{groupId}";
    public static final String JOIN_GROUP = GROUPS + "/join/{inviteToken}";
    public static final String GET_INVITE_LINK = GROUP_ID + "/invite-link";
    public static final String GROUP_MEMBERS = GROUP_ID + "/members/count";
}
