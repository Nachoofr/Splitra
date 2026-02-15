package com.intern.splitra.constant;

public class ExpenseApiEndpointConstants {
    public static final String SPLITRA = "/splitra";
    public static final String EXPENSES = SPLITRA + "/expenses";
    public static final String EXPENSES_ID = EXPENSES + "/{expenseId}";
    public static final String GROUP_EXPENSES = EXPENSES + "/group/{groupId}";
    public static final String GROUP_EXPENSES_ID = EXPENSES_ID + "/group/{groupId}";
    public static final String TOTAL_EXPENSES = GROUP_EXPENSES + "/total";
}
