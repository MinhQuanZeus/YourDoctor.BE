module.exports = Object.freeze({
    ROLE_PATIENT: 1,
    ROLE_DOCTOR: 2,
    ROLE_STAFF: 3,
    ROLE_ADMIN: 4,
    STATUS_USER_ACTIVE: 1,
    STATUS_USER_BLOCK: 3,
    STATUS_DOCTOR_PENDING: 2,
    STATUS_DOCTOR_BLOCK: 4,
    DELETED_ENTITY: 1,
    NOT_DELETED_ENTITY: 0,
    FIRST_RATTING: 2.5,
    STATUS_CONVERSATION_TALKING: 1,
    STATUS_CONVERSATION_FINISH: 2,
    RECORD_CHAT_STRING: 1,
    RECORD_CHAT_IMAGE: 2,
    CHAT_HISTORY_EXIST: 1,
    CHAT_HISTORY_PATIENT_DELETE: 2,
    CHAT_HISTORY_DOCTOR_DELETE: 3,
    PERCENT_PAY_FOR_DOCTOR: 0.8,
    TIME_REPLY_APPROVAL: 600,
    PAYMENT_SUCCESS: 1,
    PAYMENT_FAILED: 2,
    MALE: 1,
    FEMALE: 2,
    GENDER_OTHER: 3,
    NOTIFICATION_TYPE_CHAT: '1',
    NOTIFICATION_TYPE_VIDEO_CALL: '2',
    NOTIFICATION_TYPE_PAYMENT: '3',
    NOTIFICATION_TYPE_BANKING: '4',
    NOTIFICATION_TYPE_REPORT: '5',
    NOTIFICATION_TYPE_ROLE: '6',
    ID_ADMIN: '5b75a076370072f452dc3df2',
    NAME_ADMIN: 'ADMIN',
    DEADLINE_TIME_REPLY: 2,
    BANKING_HISTORY_PENDING_VERIFY: 1,
    BANKING_HISTORY_VERIFIED: 2,
    BANKING_HISTORY_DONE: 3,
    BANKING_HISTORY_FAILED:4,
    BANKKING_TYPE_Withdrawal: 1,
    BANKKING_TYPE_Recharge: 2,
    SYSTEM_RATE_PERCENT: 0.5,
    REPORT_PUNISH_LEVEL_ONE: 1, //Trừ 1 sao đánh giá hệ thống
    REPORT_PUNISH_LEVEL_TWO: 2, //Trừ 1.5 sao đánh giá hệ thống
    REPORT_PUNISH_LEVEL_THREE: 3, //Trừ 2 sao đánh giá hệ thống
    REPORT_PUNISH_LEVEL_FOUR: 4, //Trừ 2.5 sao đánh giá hệ thống
    REPORT_PUNISH_LEVEL_FIVE: 5, //Block
    REPORT_PUNISH_LEVEL_SIX: 6 //Không xử lý
});
