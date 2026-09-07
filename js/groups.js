console.log("👥 groups.js loaded");
console.log("🔥 GROUPS VERSION: INVITE-MEMBERS-REMOVE-1");


// =========================================================
// SUPABASE
// =========================================================

const groupsSupabaseUrl =
    "https://hvslktufqrgdgrgxmvcm.supabase.co";

const groupsSupabaseKey =
    "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";

let groupsSupabase = null;


// =========================================================
// DEFAULT GROUP IMAGE
// =========================================================

const DEFAULT_GROUP_IMAGE =
    "images/imagegroupsocialwiki.webp";


// =========================================================
// CREATE SUPABASE CLIENT
// =========================================================

if (window.supabase) {

    groupsSupabase =
        window.supabase.createClient(
            groupsSupabaseUrl,
            groupsSupabaseKey
        );

    console.log(
        "✅ Groups Supabase client created"
    );

} else {

    console.error(
        "❌ Supabase JavaScript library not found"
    );
}


// =========================================================
// DOM - CREATE GROUP
// =========================================================

const createGroupButton =
    document.getElementById("createGroupButton");

const createGroupModal =
    document.getElementById("createGroupModal");

const groupModalOverlay =
    document.querySelector(".group-modal-overlay");

const closeGroupModal =
    document.getElementById("closeGroupModal");

const cancelGroupButton =
    document.getElementById("cancelGroupButton");

const createGroupForm =
    document.getElementById("createGroupForm");

const saveGroupButton =
    document.getElementById("saveGroupButton");

const groupNameInput =
    document.getElementById("groupNameInput");

const groupDescriptionInput =
    document.getElementById("groupDescriptionInput");

const groupPrivacySelect =
    document.getElementById("groupPrivacySelect");

const groupFormMessage =
    document.getElementById("groupFormMessage");


// =========================================================
// DOM - GROUPS
// =========================================================

const groupsGrid =
    document.getElementById("groupsGrid");

const groupSearchInput =
    document.getElementById("groupSearchInput");


// =========================================================
// DOM - EDIT GROUP
// =========================================================

const editGroupModal =
    document.getElementById("editGroupModal");

const editGroupModalOverlay =
    document.getElementById("editGroupModalOverlay");

const closeEditGroupModal =
    document.getElementById("closeEditGroupModal");

const cancelEditGroupButton =
    document.getElementById("cancelEditGroupButton");

const editGroupForm =
    document.getElementById("editGroupForm");

const editGroupNameInput =
    document.getElementById("editGroupNameInput");

const editGroupDescriptionInput =
    document.getElementById("editGroupDescriptionInput");

const editGroupPrivacySelect =
    document.getElementById("editGroupPrivacySelect");


// =========================================================
// EDIT GROUP IMAGE ELEMENTS
// =========================================================

const editGroupCoverFileInput =
    document.getElementById(
        "editGroupCoverFileInput"
    );

const editGroupAvatarFileInput =
    document.getElementById(
        "editGroupAvatarFileInput"
    );

const editGroupCoverUploadButton =
    document.getElementById(
        "editGroupCoverUploadButton"
    );

const editGroupAvatarUploadButton =
    document.getElementById(
        "editGroupAvatarUploadButton"
    );

const editGroupCoverPreview =
    document.getElementById(
        "editGroupCoverPreview"
    );

const editGroupAvatarPreview =
    document.getElementById(
        "editGroupAvatarPreview"
    );

const editGroupFormMessage =
    document.getElementById(
        "editGroupFormMessage"
    );

const saveEditGroupButton =
    document.getElementById(
        "saveEditGroupButton"
    );


// =========================================================
// STATE
// =========================================================

let currentGroupUser = null;

let allGroups = [];

let editingGroupId = null;


// =========================================================
// DYNAMIC PEOPLE MODALS
// =========================================================

let groupPeopleModalsReady = false;

let currentMembersGroup = null;

let currentInviteGroup = null;


// =========================================================
// CREATE MESSAGE
// =========================================================

function showGroupMessage(
    message,
    type = "error"
) {

    if (!groupFormMessage) {
        return;
    }

    groupFormMessage.textContent =
        message;

    groupFormMessage.className =
        "group-form-message " + type;

    groupFormMessage.hidden =
        false;
}


function hideGroupMessage() {

    if (!groupFormMessage) {
        return;
    }

    groupFormMessage.textContent =
        "";

    groupFormMessage.className =
        "group-form-message";

    groupFormMessage.hidden =
        true;
}


// =========================================================
// EDIT MESSAGE
// =========================================================

function showEditGroupMessage(
    message,
    type = "error"
) {

    if (!editGroupFormMessage) {
        return;
    }

    editGroupFormMessage.textContent =
        message;

    editGroupFormMessage.className =
        "group-form-message " + type;

    editGroupFormMessage.hidden =
        false;
}


function hideEditGroupMessage() {

    if (!editGroupFormMessage) {
        return;
    }

    editGroupFormMessage.textContent =
        "";

    editGroupFormMessage.className =
        "group-form-message";

    editGroupFormMessage.hidden =
        true;
}


// =========================================================
// CREATE PEOPLE MODALS
// =========================================================

function ensureGroupPeopleModals() {

    if (groupPeopleModalsReady) {
        return;
    }


    // =====================================================
    // MEMBERS MODAL
    // =====================================================

    const membersModal =
        document.createElement("div");

    membersModal.id =
        "groupMembersModal";

    membersModal.className =
        "group-modal";

    membersModal.hidden =
        true;

    membersModal.innerHTML = `

        <div
            class="group-modal-overlay"
            id="groupMembersModalOverlay"
        ></div>

        <div
            class="group-modal-content"
            style="
                max-width:600px;
                width:92%;
            "
        >

            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:15px;
                    margin-bottom:20px;
                "
            >

                <h2
                    style="
                        margin:0;
                    "
                >
                    👥 Group Members
                </h2>

                <button
                    type="button"
                    id="closeGroupMembersModal"
                    style="
                        border:none;
                        background:none;
                        font-size:24px;
                        cursor:pointer;
                    "
                >
                    ×
                </button>

            </div>

            <div
                id="groupMembersList"
                style="
                    display:flex;
                    flex-direction:column;
                    gap:10px;
                    max-height:60vh;
                    overflow-y:auto;
                "
            ></div>

        </div>
    `;


    // =====================================================
    // INVITE MODAL
    // =====================================================

    const inviteModal =
        document.createElement("div");

    inviteModal.id =
        "groupInviteModal";

    inviteModal.className =
        "group-modal";

    inviteModal.hidden =
        true;

    inviteModal.innerHTML = `

        <div
            class="group-modal-overlay"
            id="groupInviteModalOverlay"
        ></div>

        <div
            class="group-modal-content"
            style="
                max-width:600px;
                width:92%;
            "
        >

            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:15px;
                    margin-bottom:20px;
                "
            >

                <div>

                    <h2
                        style="
                            margin:0 0 5px 0;
                        "
                    >
                        📩 Invite People
                    </h2>

                    <p
                        id="groupInviteTitle"
                        style="
                            margin:0;
                            opacity:.7;
                        "
                    ></p>

                </div>

                <button
                    type="button"
                    id="closeGroupInviteModal"
                    style="
                        border:none;
                        background:none;
                        font-size:24px;
                        cursor:pointer;
                    "
                >
                    ×
                </button>

            </div>


            <div
                style="
                    margin-bottom:15px;
                "
            >

                <input
                    type="text"
                    id="groupInviteSearchInput"
                    placeholder="Search username..."
                    autocomplete="off"
                    style="
                        width:100%;
                        padding:12px 14px;
                        border:1px solid #ddd;
                        border-radius:10px;
                        font-size:15px;
                        box-sizing:border-box;
                    "
                >

            </div>


            <div
                id="groupInviteMessage"
                style="
                    margin-bottom:12px;
                    display:none;
                "
            ></div>


            <div
                id="groupInviteResults"
                style="
                    display:flex;
                    flex-direction:column;
                    gap:10px;
                    max-height:55vh;
                    overflow-y:auto;
                "
            >

                <div
                    style="
                        text-align:center;
                        opacity:.6;
                        padding:25px;
                    "
                >
                    🔎 Search for a username
                </div>

            </div>

        </div>
    `;


    document.body.appendChild(
        membersModal
    );

    document.body.appendChild(
        inviteModal
    );


    // =====================================================
    // MEMBERS EVENTS
    // =====================================================

    document
        .getElementById(
            "closeGroupMembersModal"
        )
        ?.addEventListener(
            "click",
            closeGroupMembersModal
        );


    document
        .getElementById(
            "groupMembersModalOverlay"
        )
        ?.addEventListener(
            "click",
            closeGroupMembersModal
        );


    // =====================================================
    // INVITE EVENTS
    // =====================================================

    document
        .getElementById(
            "closeGroupInviteModal"
        )
        ?.addEventListener(
            "click",
            closeGroupInviteModal
        );


    document
        .getElementById(
            "groupInviteModalOverlay"
        )
        ?.addEventListener(
            "click",
            closeGroupInviteModal
        );


    const inviteSearchInput =
        document.getElementById(
            "groupInviteSearchInput"
        );


    if (inviteSearchInput) {

        inviteSearchInput.addEventListener(
            "input",
            function () {

                searchUsersForGroupInvite(
                    this.value
                );

            }
        );
    }


    groupPeopleModalsReady =
        true;


    console.log(
        "✅ Group Members + Invite modals created"
    );
}


// =========================================================
// OPEN MEMBERS MODAL
// =========================================================

async function openGroupMembersModal(
    group
) {

    ensureGroupPeopleModals();


    if (!group) {
        return;
    }


    currentMembersGroup =
        group;


    const modal =
        document.getElementById(
            "groupMembersModal"
        );

    const list =
        document.getElementById(
            "groupMembersList"
        );


    if (!modal || !list) {
        return;
    }


    modal.hidden =
        false;

    modal.classList.add(
        "active"
    );

    modal.style.display =
        "flex";

    document.body.style.overflow =
        "hidden";


    list.innerHTML = `

        <div
            style="
                text-align:center;
                padding:30px;
                opacity:.7;
            "
        >
            ⏳ Loading members...
        </div>
    `;


    await loadGroupMembers(
        group.id
    );
}


// =========================================================
// CLOSE MEMBERS MODAL
// =========================================================

function closeGroupMembersModal() {

    const modal =
        document.getElementById(
            "groupMembersModal"
        );


    if (!modal) {
        return;
    }


    modal.hidden =
        true;

    modal.classList.remove(
        "active"
    );

    modal.style.display =
        "";

    currentMembersGroup =
        null;

    document.body.style.overflow =
        "";
}


// =========================================================
// LOAD GROUP MEMBERS
// =========================================================

async function loadGroupMembers(
    groupId
) {

    const list =
        document.getElementById(
            "groupMembersList"
        );


    if (!list) {
        return;
    }


    try {

        // =====================================================
        // LOAD GROUP OWNER
        // =====================================================

        const {
            data: groupInfo,
            error: groupInfoError
        } =
            await groupsSupabase
                .from("groups")
                .select(
                    "id, name, owner_id"
                )
                .eq(
                    "id",
                    groupId
                )
                .maybeSingle();


        if (groupInfoError) {

            console.error(
                "❌ Loading group information error:",
                groupInfoError
            );

            list.innerHTML = `

                <div
                    style="
                        padding:25px;
                        text-align:center;
                    "
                >
                    ❌ Unable to load group information.
                </div>

            `;

            return;
        }


        if (!groupInfo) {

            list.innerHTML = `

                <div
                    style="
                        padding:25px;
                        text-align:center;
                    "
                >
                    ❌ Group not found.
                </div>

            `;

            return;
        }


        // =====================================================
        // LOAD MEMBERS
        // =====================================================

        const {
            data: members,
            error: membersError
        } =
            await groupsSupabase
                .from("group_members")
                .select(
                    "user_id, role"
                )
                .eq(
                    "group_id",
                    groupId
                );


        if (membersError) {

            console.error(
                "❌ Loading members error:",
                membersError
            );


            list.innerHTML = `

                <div
                    style="
                        padding:25px;
                        text-align:center;
                    "
                >
                    ❌ Unable to load members.
                </div>

            `;

            return;
        }


        let membersList =
            Array.isArray(members)
                ? [...members]
                : [];


        // =====================================================
        // ENSURE OWNER EXISTS IN MEMBER LIST
        // =====================================================

        const ownerExists =
            membersList.some(
                member =>
                    String(
                        member.user_id
                    ) ===
                    String(
                        groupInfo.owner_id
                    )
            );


        if (!ownerExists) {

            membersList.unshift({

                user_id:
                    groupInfo.owner_id,

                role:
                    "owner"

            });

        }


        if (
            membersList.length === 0
        ) {

            list.innerHTML = `

                <div
                    style="
                        padding:25px;
                        text-align:center;
                        opacity:.7;
                    "
                >
                    👥 No members found.
                </div>

            `;

            return;
        }


        // =====================================================
        // USER IDS
        // =====================================================

        const userIds =
            membersList.map(
                member =>
                    member.user_id
            );


        // =====================================================
        // LOAD PROFILES
        // =====================================================

        const {
            data: profiles,
            error: profilesError
        } =
            await groupsSupabase
                .from("profiles")
                .select(
                    "id, username, full_name, avatar_url"
                )
                .in(
                    "id",
                    userIds
                );


        if (profilesError) {

            console.error(
                "❌ Loading member profiles error:",
                profilesError
            );

        }


        const profileMap =
            new Map();


        (profiles || []).forEach(
            profile => {

                profileMap.set(
                    String(profile.id),
                    profile
                );

            }
        );


        // =====================================================
        // SORT
        // OWNER → ADMIN → MEMBER
        // =====================================================

        const roleOrder = {

            owner:
                1,

            admin:
                2,

            member:
                3

        };


        membersList.sort(
            (a, b) => {

                const roleA =
                    roleOrder[
                        a.role
                    ] || 99;


                const roleB =
                    roleOrder[
                        b.role
                    ] || 99;


                return roleA - roleB;

            }
        );


        // =====================================================
        // CURRENT USER
        // =====================================================

        if (!currentGroupUser) {

            currentGroupUser =
                await getCurrentGroupUser();

        }


        const isCurrentUserOwner =
            currentGroupUser &&
            String(
                groupInfo.owner_id
            ).trim() ===
            String(
                currentGroupUser.id
            ).trim();

        // =====================================================
        // CURRENT USER ADMIN CHECK
        // =====================================================

        let isCurrentUserAdmin =
            false;


        if (
            currentGroupUser &&
            !isCurrentUserOwner
        ) {

            const {
                data: currentMembership,
                error: currentMembershipError
            } =
                await groupsSupabase
                    .from("group_members")
                    .select("role")
                    .eq(
                        "group_id",
                        groupId
                    )
                    .eq(
                        "user_id",
                        currentGroupUser.id
                    )
                    .maybeSingle();


            if (currentMembershipError) {

                console.error(
                    "❌ Current user admin check error:",
                    currentMembershipError
                );

            }


            isCurrentUserAdmin =
                currentMembership?.role ===
                "admin";
        }

        // =====================================================
        // UPDATE TITLE
        // =====================================================

        const membersModal =
            document.getElementById(
                "groupMembersModal"
            );


        const membersTitle =
            membersModal?.querySelector(
                "h2"
            );


        if (membersTitle) {

            membersTitle.textContent =
                `👥 Group Members (${membersList.length})`;

        }


        // =====================================================
        // CLEAR LIST
        // =====================================================

        list.innerHTML =
            "";


        // =====================================================
        // RENDER MEMBERS
        // =====================================================

        membersList.forEach(
            member => {

                const profile =
                    profileMap.get(
                        String(
                            member.user_id
                        )
                    );


                const username =
                    profile?.username ||
                    "User";


                const fullName =
                    profile?.full_name ||
                    "";


                const avatar =
                    profile?.avatar_url ||
                    "";


                const role =
                    member.role ||
                    "member";


                const isOwner =
                    role === "owner";


                const isAdmin =
                    role === "admin";


                const isMember =
                    role === "member";

                // MANAGEMENT PERMISSIONS
                // =================================================

                const isSelf =
                    String(
                        member.user_id
                    ) ===
                    String(
                        currentGroupUser?.id
                    );


                // Owner can manage Admins + Members
                const canManage =
                    isCurrentUserOwner &&
                    !isOwner &&
                    !isSelf;


                // Admin can manage Members only
                const canAdminRemove =
                    isCurrentUserAdmin &&
                    isMember &&
                    !isSelf;


                // =================================================
                // ROLE DISPLAY
                // =================================================

                let roleLabel =
                    "Member";


                let roleBackground =
                    "#f5f5f5";


                let roleColor =
                    "#555";


                if (isOwner) {

                    roleLabel =
                        "👑 Owner";

                    roleBackground =
                        "#fff4cc";

                    roleColor =
                        "#8a6500";

                }
                else if (isAdmin) {

                    roleLabel =
                        "🛡️ Admin";

                    roleBackground =
                        "#eaf2ff";

                    roleColor =
                        "#175cd3";

                }
                else {

                    roleLabel =
                        "👤 Member";

                }


                // =================================================
                // ROW
                // =================================================

                const row =
                    document.createElement(
                        "div"
                    );


                row.style.cssText = `
                    display:flex;
                    align-items:center;
                    gap:12px;
                    padding:12px;
                    border:1px solid #eee;
                    border-radius:12px;
                    background:#fff;
                    margin-bottom:8px;
                `;


                // =================================================
                // AVATAR
                // =================================================

                const avatarHTML =
                    avatar
                        ? `

                            <img
                                src="${escapeHTML(avatar)}"
                                alt="${escapeHTML(username)}"
                                style="
                                    width:48px;
                                    height:48px;
                                    border-radius:50%;
                                    object-fit:cover;
                                    flex-shrink:0;
                                "
                            >

                          `
                        : `

                            <div
                                style="
                                    width:48px;
                                    height:48px;
                                    border-radius:50%;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    background:#eee;
                                    font-size:22px;
                                    flex-shrink:0;
                                "
                            >
                                👤
                            </div>

                          `;


                // =================================================
                // ACTION BUTTONS
                // =================================================

                let actionHTML = "";

                if (canManage || canAdminRemove) {

                    // =============================================
                    // MEMBER
                    // OWNER → PROMOTE + REMOVE
                    // ADMIN → REMOVE ONLY
                    // =============================================

                    if (isMember) {

                        if (isCurrentUserOwner) {

                            actionHTML = `

                                <button
                                    type="button"
                                    class="promote-group-member-button"
                                    data-user-id="${escapeHTML(member.user_id)}"
                                    style="
                                        border:none;
                                        border-radius:8px;
                                        padding:7px 10px;
                                        cursor:pointer;
                                        font-weight:700;
                                        background:#eaf2ff;
                                        color:#175cd3;
                                    "
                                >
                                    Promote
                                </button>

                                <button
                                    type="button"
                                    class="remove-group-member-button"
                                    data-user-id="${escapeHTML(member.user_id)}"
                                    style="
                                        border:none;
                                        border-radius:8px;
                                        padding:7px 10px;
                                        cursor:pointer;
                                        font-weight:700;
                                        background:#fff0f0;
                                        color:#b42318;
                                    "
                                >
                                    Remove
                                </button>

                            `;

                        }

                        else if (isCurrentUserAdmin) {

                            actionHTML = `

                                <button
                                    type="button"
                                    class="remove-group-member-button"
                                    data-user-id="${escapeHTML(member.user_id)}"
                                    style="
                                        border:none;
                                        border-radius:8px;
                                        padding:7px 10px;
                                        cursor:pointer;
                                        font-weight:700;
                                        background:#fff0f0;
                                        color:#b42318;
                                    "
                                >
                                    Remove
                                </button>

                            `;
                        }
                    }


                    // =============================================
                    // ADMIN
                    // OWNER → DEMOTE + REMOVE
                    // ADMIN → NOTHING
                    // =============================================

                    else if (isAdmin) {

                        if (isCurrentUserOwner) {

                            actionHTML = `

                                <button
                                    type="button"
                                    class="demote-group-member-button"
                                    data-user-id="${escapeHTML(member.user_id)}"
                                    style="
                                        border:none;
                                        border-radius:8px;
                                        padding:7px 10px;
                                        cursor:pointer;
                                        font-weight:700;
                                        background:#f5f5f5;
                                        color:#444;
                                    "
                                >
                                    Demote
                                </button>

                                <button
                                    type="button"
                                    class="remove-group-member-button"
                                    data-user-id="${escapeHTML(member.user_id)}"
                                    style="
                                        border:none;
                                        border-radius:8px;
                                        padding:7px 10px;
                                        cursor:pointer;
                                        font-weight:700;
                                        background:#fff0f0;
                                        color:#b42318;
                                    "
                                >
                                    Remove
                                </button>

                            `;
                        }
                    }
                }

                // =================================================
                // HTML
                // =================================================

                row.innerHTML = `

                    ${avatarHTML}


                    <div
                        style="
                            min-width:0;
                            flex:1;
                        "
                    >

                        <div
                            style="
                                font-weight:700;
                                overflow:hidden;
                                text-overflow:ellipsis;
                                white-space:nowrap;
                            "
                        >
                            ${escapeHTML(username)}
                        </div>


                        ${
                            fullName
                                ? `

                                    <div
                                        style="
                                            font-size:13px;
                                            opacity:.65;
                                            margin-top:2px;
                                            overflow:hidden;
                                            text-overflow:ellipsis;
                                            white-space:nowrap;
                                        "
                                    >
                                        ${escapeHTML(fullName)}
                                    </div>

                                  `
                                : ""
                        }

                    </div>


                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:8px;
                            flex-shrink:0;
                            flex-wrap:wrap;
                            justify-content:flex-end;
                        "
                    >

                        <div
                            style="
                                font-size:12px;
                                font-weight:700;
                                padding:5px 9px;
                                border-radius:20px;
                                background:${roleBackground};
                                color:${roleColor};
                            "
                        >
                            ${roleLabel}
                        </div>


                        ${actionHTML}

                    </div>

                `;


                // =================================================
                // PROMOTE BUTTON
                // =================================================

                const promoteButton =
                    row.querySelector(
                        ".promote-group-member-button"
                    );


                if (promoteButton) {

                    promoteButton.addEventListener(
                        "click",
                        async () => {

                            await promoteGroupMember(
                                groupId,
                                member.user_id,
                                promoteButton
                            );

                        }
                    );

                }


                // =================================================
                // DEMOTE BUTTON
                // =================================================

                const demoteButton =
                    row.querySelector(
                        ".demote-group-member-button"
                    );


                if (demoteButton) {

                    demoteButton.addEventListener(
                        "click",
                        async () => {

                            await demoteGroupMember(
                                groupId,
                                member.user_id,
                                demoteButton
                            );

                        }
                    );

                }


                // =================================================
                // REMOVE BUTTON
                // =================================================

                const removeButton =
                    row.querySelector(
                        ".remove-group-member-button"
                    );


                if (removeButton) {

                    removeButton.addEventListener(
                        "click",
                        async () => {

                            await removeGroupMember(
                                groupId,
                                member.user_id,
                                removeButton
                            );

                        }
                    );

                }


                list.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "❌ Unexpected members error:",
            error
        );


        list.innerHTML = `

            <div
                style="
                    padding:25px;
                    text-align:center;
                "
            >
                ❌ Unexpected error loading members.
            </div>

        `;

    }
}


// =========================================================
// PROMOTE GROUP MEMBER TO ADMIN
// =========================================================

async function promoteGroupMember(
    groupId,
    userId,
    button
) {

    console.log(
        "🛡️ Promoting member to admin:",
        {
            groupId,
            userId
        }
    );


    if (!groupsSupabase) {

        alert(
            "Supabase connection is unavailable."
        );

        return;
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();

    }


    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return;
    }


    try {

        // =====================================================
        // VERIFY OWNER
        // =====================================================

        const {
            data: group,
            error: groupError
        } =
            await groupsSupabase
                .from("groups")
                .select(
                    "id, name, owner_id"
                )
                .eq(
                    "id",
                    groupId
                )
                .single();


        if (groupError) {

            console.error(
                "❌ Group owner lookup error:",
                groupError
            );

            alert(
                "Could not verify group ownership."
            );

            return;
        }


        if (
            !group ||
            String(group.owner_id).trim() !==
            String(currentGroupUser.id).trim()
        ) {

            alert(
                "Only the group owner can promote members."
            );

            return;
        }


        if (
            String(userId).trim() ===
            String(currentGroupUser.id).trim()
        ) {

            alert(
                "You cannot change your own role."
            );

            return;
        }


        // =====================================================
        // CONFIRM
        // =====================================================

        const confirmed =
            confirm(
                "Promote this member to Admin?"
            );


        if (!confirmed) {
            return;
        }


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Promoting...";

        }


        // =====================================================
        // UPDATE ROLE
        // =====================================================

        const {
            error: updateError
        } =
            await groupsSupabase
                .from("group_members")
                .update({

                    role:
                        "admin"

                })
                .eq(
                    "group_id",
                    groupId
                )
                .eq(
                    "user_id",
                    userId
                );


        if (updateError) {

            console.error(
                "❌ Promote member error:",
                updateError
            );


            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "Promote";

            }


            alert(
                "Could not promote member: " +
                updateError.message
            );

            return;
        }


        console.log(
            "✅ Member promoted to admin"
        );


        // =====================================================
        // RELOAD MEMBERS
        // =====================================================

        await loadGroupMembers(
            groupId
        );


        await renderGroups(
            allGroups
        );


    } catch (error) {

        console.error(
            "❌ Unexpected promote error:",
            error
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Promote";

        }


        alert(
            "Could not promote member: " +
            (
                error.message ||
                "Unexpected error."
            )
        );

    }
}


// =========================================================
// DEMOTE ADMIN TO MEMBER
// =========================================================

async function demoteGroupMember(
    groupId,
    userId,
    button
) {

    console.log(
        "👤 Demoting admin to member:",
        {
            groupId,
            userId
        }
    );


    if (!groupsSupabase) {

        alert(
            "Supabase connection is unavailable."
        );

        return;
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();

    }


    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return;
    }


    try {

        // =====================================================
        // VERIFY OWNER
        // =====================================================

        const {
            data: group,
            error: groupError
        } =
            await groupsSupabase
                .from("groups")
                .select(
                    "id, name, owner_id"
                )
                .eq(
                    "id",
                    groupId
                )
                .single();


        if (groupError) {

            console.error(
                "❌ Group owner lookup error:",
                groupError
            );

            alert(
                "Could not verify group ownership."
            );

            return;
        }


        if (
            !group ||
            String(group.owner_id).trim() !==
            String(currentGroupUser.id).trim()
        ) {

            alert(
                "Only the group owner can demote admins."
            );

            return;
        }


        if (
            String(userId).trim() ===
            String(currentGroupUser.id).trim()
        ) {

            alert(
                "You cannot change your own role."
            );

            return;
        }


        // =====================================================
        // CONFIRM
        // =====================================================

        const confirmed =
            confirm(
                "Demote this Admin to Member?"
            );


        if (!confirmed) {
            return;
        }


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Demoting...";

        }


        // =====================================================
        // UPDATE ROLE
        // =====================================================

        const {
            error: updateError
        } =
            await groupsSupabase
                .from("group_members")
                .update({

                    role:
                        "member"

                })
                .eq(
                    "group_id",
                    groupId
                )
                .eq(
                    "user_id",
                    userId
                );


        if (updateError) {

            console.error(
                "❌ Demote member error:",
                updateError
            );


            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "Demote";

            }


            alert(
                "Could not demote admin: " +
                updateError.message
            );

            return;
        }


        console.log(
            "✅ Admin demoted to member"
        );


        // =====================================================
        // RELOAD MEMBERS
        // =====================================================

        await loadGroupMembers(
            groupId
        );


        await renderGroups(
            allGroups
        );


    } catch (error) {

        console.error(
            "❌ Unexpected demote error:",
            error
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Demote";

        }


        alert(
            "Could not demote admin: " +
            (
                error.message ||
                "Unexpected error."
            )
        );

    }
}


// =========================================================
// REMOVE GROUP MEMBER
// OWNER + ADMIN PERMISSIONS
// =========================================================

async function removeGroupMember(
    groupId,
    userId,
    button
) {

    console.log(
        "🗑️ Removing group member:",
        {
            groupId,
            userId
        }
    );


    if (!groupsSupabase) {

        alert(
            "Supabase connection is unavailable."
        );

        return;
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return;
    }


    if (
        !groupId ||
        !userId
    ) {

        alert(
            "Invalid group member."
        );

        return;
    }


    try {

        // =====================================================
        // LOAD GROUP
        // =====================================================

        const {
            data: group,
            error: groupError
        } =
            await groupsSupabase
                .from("groups")
                .select(
                    "id, name, owner_id"
                )
                .eq(
                    "id",
                    groupId
                )
                .single();


        if (groupError) {

            console.error(
                "❌ Group lookup error:",
                groupError
            );

            alert(
                "Could not verify group."
            );

            return;
        }


        if (!group) {

            alert(
                "Group not found."
            );

            return;
        }


        // =====================================================
        // CHECK CURRENT USER ROLE
        // =====================================================

        let currentUserRole =
            null;


        if (
            String(group.owner_id).trim() ===
            String(currentGroupUser.id).trim()
        ) {

            currentUserRole =
                "owner";

        } else {

            const {
                data: currentMembership,
                error: membershipError
            } =
                await groupsSupabase
                    .from("group_members")
                    .select(
                        "role"
                    )
                    .eq(
                        "group_id",
                        groupId
                    )
                    .eq(
                        "user_id",
                        currentGroupUser.id
                    )
                    .maybeSingle();


            if (membershipError) {

                console.error(
                    "❌ Current member role lookup error:",
                    membershipError
                );

                alert(
                    "Could not verify your group role."
                );

                return;
            }


            currentUserRole =
                currentMembership?.role ||
                null;
        }


        console.log(
            "👤 Current user role:",
            currentUserRole
        );


        // =====================================================
        // ONLY OWNER OR ADMIN
        // =====================================================

        if (
            currentUserRole !== "owner" &&
            currentUserRole !== "admin"
        ) {

            alert(
                "Only the group owner or an admin can remove members."
            );

            return;
        }


        // =====================================================
        // CANNOT REMOVE YOURSELF
        // =====================================================

        if (
            String(userId).trim() ===
            String(currentGroupUser.id).trim()
        ) {

            alert(
                "You cannot remove yourself from here."
            );

            return;
        }


        // =====================================================
        // LOAD TARGET MEMBER ROLE
        // =====================================================

        const {
            data: targetMembership,
            error: targetError
        } =
            await groupsSupabase
                .from("group_members")
                .select(
                    "user_id, role"
                )
                .eq(
                    "group_id",
                    groupId
                )
                .eq(
                    "user_id",
                    userId
                )
                .maybeSingle();


        if (targetError) {

            console.error(
                "❌ Target member lookup error:",
                targetError
            );

            alert(
                "Could not verify the selected member."
            );

            return;
        }


        if (!targetMembership) {

            alert(
                "This user is not a member of the group."
            );

            return;
        }


        // =====================================================
        // NEVER REMOVE OWNER
        // =====================================================

        if (
            targetMembership.role === "owner" ||
            String(group.owner_id).trim() ===
            String(userId).trim()
        ) {

            alert(
                "The group owner cannot be removed."
            );

            return;
        }


        // =====================================================
        // ADMIN CANNOT REMOVE ANOTHER ADMIN
        // =====================================================

        if (
            currentUserRole === "admin" &&
            targetMembership.role === "admin"
        ) {

            alert(
                "Admins cannot remove another admin."
            );

            return;
        }


        // =====================================================
        // CONFIRM
        // =====================================================

        const confirmed =
            confirm(
                "Are you sure you want to remove this member from the group?"
            );


        if (!confirmed) {
            return;
        }


        // =====================================================
        // BUTTON LOADING
        // =====================================================

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Removing...";
        }


        // =====================================================
        // DELETE MEMBER
        // =====================================================

        const {
            error: deleteError
        } =
            await groupsSupabase
                .from("group_members")
                .delete()
                .eq(
                    "group_id",
                    groupId
                )
                .eq(
                    "user_id",
                    userId
                );


        if (deleteError) {

            console.error(
                "❌ Remove member error:",
                deleteError
            );


            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "Remove";
            }


            alert(
                "Could not remove member: " +
                deleteError.message
            );

            return;
        }


        console.log(
            "✅ Member removed successfully"
        );


        // =====================================================
        // RELOAD MEMBERS
        // =====================================================

        await loadGroupMembers(
            groupId
        );


        // =====================================================
        // UPDATE GROUP CARD MEMBER COUNT
        // =====================================================

        await renderGroups(
            allGroups
        );


        console.log(
            "🔄 Group member count refreshed"
        );


    } catch (error) {

        console.error(
            "❌ Unexpected remove member error:",
            error
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Remove";
        }


        alert(
            "Could not remove member: " +
            (
                error.message ||
                "Unexpected error."
            )
        );
    }
}


// =========================================================
// OPEN INVITE MODAL
// =========================================================

async function openGroupInviteModal(
    group
) {

    ensureGroupPeopleModals();


    if (!group) {
        return;
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return;
    }


    const isOwner =
        String(group.owner_id).trim() ===
        String(currentGroupUser.id).trim();


    if (!isOwner) {

        alert(
            "Only the group owner can invite people."
        );

        return;
    }


    currentInviteGroup =
        group;


    const modal =
        document.getElementById(
            "groupInviteModal"
        );

    const title =
        document.getElementById(
            "groupInviteTitle"
        );

    const input =
        document.getElementById(
            "groupInviteSearchInput"
        );

    const results =
        document.getElementById(
            "groupInviteResults"
        );


    if (
        !modal ||
        !title ||
        !input ||
        !results
    ) {
        return;
    }


    title.textContent =
        `Invite someone to "${group.name}"`;


    input.value =
        "";


    results.innerHTML = `

        <div
            style="
                text-align:center;
                opacity:.6;
                padding:25px;
            "
        >
            🔎 Search for a username
        </div>
    `;


    modal.hidden =
        false;

    modal.classList.add(
        "active"
    );

    modal.style.display =
        "flex";

    document.body.style.overflow =
        "hidden";


    setTimeout(
        () => {

            input.focus();

        },
        100
    );
}


// =========================================================
// CLOSE INVITE MODAL
// =========================================================

function closeGroupInviteModal() {

    const modal =
        document.getElementById(
            "groupInviteModal"
        );


    if (!modal) {
        return;
    }


    modal.hidden =
        true;

    modal.classList.remove(
        "active"
    );

    modal.style.display =
        "";

    currentInviteGroup =
        null;

    document.body.style.overflow =
        "";
}


// =========================================================
// INVITE MESSAGE
// =========================================================

function showGroupInviteMessage(
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            "groupInviteMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.style.display =
        "block";


    element.style.padding =
        "10px 12px";


    element.style.borderRadius =
        "8px";


    element.style.background =
        type === "success"
            ? "#e9f8ee"
            : "#fff0f0";


    element.style.color =
        type === "success"
            ? "#187a3d"
            : "#b42318";
}


function hideGroupInviteMessage() {

    const element =
        document.getElementById(
            "groupInviteMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        "";

    element.style.display =
        "none";
}


// =========================================================
// SEARCH USERS FOR INVITE
// =========================================================

let inviteSearchTimer = null;


async function searchUsersForGroupInvite(
    value
) {

    const query =
        String(value || "")
            .trim();


    const results =
        document.getElementById(
            "groupInviteResults"
        );


    if (!results) {
        return;
    }


    hideGroupInviteMessage();


    if (!currentInviteGroup) {
        return;
    }


    if (inviteSearchTimer) {

        clearTimeout(
            inviteSearchTimer
        );
    }


    if (query.length < 2) {

        results.innerHTML = `

            <div
                style="
                    text-align:center;
                    opacity:.6;
                    padding:25px;
                "
            >
                🔎 Type at least 2 characters.
            </div>
        `;

        return;
    }


    inviteSearchTimer =
        setTimeout(
            async () => {

                await performGroupUserSearch(
                    query
                );

            },
            300
        );
}


// =========================================================
// PERFORM USER SEARCH
// =========================================================

async function performGroupUserSearch(
    query
) {

    const results =
        document.getElementById(
            "groupInviteResults"
        );


    if (
        !results ||
        !currentInviteGroup
    ) {
        return;
    }


    results.innerHTML = `

        <div
            style="
                text-align:center;
                opacity:.7;
                padding:25px;
            "
        >
            ⏳ Searching...
        </div>
    `;


    try {

        // =====================================================
        // CURRENT MEMBERS
        // =====================================================

        const {
            data: members,
            error: membersError
        } =
            await groupsSupabase
                .from("group_members")
                .select(
                    "user_id"
                )
                .eq(
                    "group_id",
                    currentInviteGroup.id
                );


        if (membersError) {

            console.error(
                "❌ Invite member lookup error:",
                membersError
            );

            results.innerHTML = `

                <div
                    style="
                        text-align:center;
                        padding:25px;
                    "
                >
                    ❌ Could not check current members.
                </div>
            `;

            return;
        }


        const memberIds =
            new Set(
                (members || []).map(
                    member =>
                        String(
                            member.user_id
                        )
                )
            );


        // =====================================================
        // SEARCH PROFILES
        // =====================================================

        const {
            data: profiles,
            error: profilesError
        } =
            await groupsSupabase
                .from("profiles")
                .select(
                    "id, username, full_name, avatar_url"
                )
                .ilike(
                    "username",
                    `%${query}%`
                )
                .limit(
                    20
                );


        if (profilesError) {

            console.error(
                "❌ User search error:",
                profilesError
            );

            results.innerHTML = `

                <div
                    style="
                        text-align:center;
                        padding:25px;
                    "
                >
                    ❌ Search failed.
                </div>
            `;

            return;
        }


        let filteredProfiles =
            (profiles || []).filter(
                profile => {

                    if (
                        String(profile.id) ===
                        String(currentGroupUser.id)
                    ) {
                        return false;
                    }


                    if (
                        memberIds.has(
                            String(profile.id)
                        )
                    ) {
                        return false;
                    }


                    return true;
                }
            );


        if (
            filteredProfiles.length === 0
        ) {

            results.innerHTML = `

                <div
                    style="
                        text-align:center;
                        opacity:.7;
                        padding:30px;
                    "
                >
                    👤 No available users found.
                </div>
            `;

            return;
        }


        // =====================================================
        // CHECK PENDING INVITATIONS
        // =====================================================

        const candidateIds =
            filteredProfiles.map(
                profile =>
                    profile.id
            );


        const {
            data: pendingInvites,
            error: pendingError
        } =
            await groupsSupabase
                .from("group_invitations")
                .select(
                    "invited_user_id"
                )
                .eq(
                    "group_id",
                    currentInviteGroup.id
                )
                .eq(
                    "status",
                    "pending"
                )
                .in(
                    "invited_user_id",
                    candidateIds
                );


        if (pendingError) {

            console.warn(
                "⚠️ Pending invitation check failed:",
                pendingError
            );
        }


        const pendingIds =
            new Set(
                (pendingInvites || []).map(
                    invite =>
                        String(
                            invite.invited_user_id
                        )
                )
            );


        results.innerHTML =
            "";


        filteredProfiles.forEach(
            profile => {

                const alreadyInvited =
                    pendingIds.has(
                        String(profile.id)
                    );


                const row =
                    document.createElement(
                        "div"
                    );


                row.style.cssText = `
                    display:flex;
                    align-items:center;
                    gap:12px;
                    padding:12px;
                    border:1px solid #eee;
                    border-radius:12px;
                    background:#fff;
                `;


                const avatar =
                    profile.avatar_url ||
                    "";


                const avatarHTML =
                    avatar
                        ? `
                            <img
                                src="${escapeHTML(avatar)}"
                                alt="${escapeHTML(profile.username || "User")}"
                                style="
                                    width:48px;
                                    height:48px;
                                    border-radius:50%;
                                    object-fit:cover;
                                    flex-shrink:0;
                                "
                            >
                          `
                        : `
                            <div
                                style="
                                    width:48px;
                                    height:48px;
                                    border-radius:50%;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    background:#eee;
                                    font-size:22px;
                                    flex-shrink:0;
                                "
                            >
                                👤
                            </div>
                          `;


                row.innerHTML = `

                    ${avatarHTML}

                    <div
                        style="
                            flex:1;
                            min-width:0;
                        "
                    >

                        <div
                            style="
                                font-weight:700;
                                overflow:hidden;
                                text-overflow:ellipsis;
                                white-space:nowrap;
                            "
                        >
                            ${escapeHTML(
                                profile.username ||
                                "User"
                            )}
                        </div>

                        ${
                            profile.full_name
                                ? `
                                    <div
                                        style="
                                            font-size:13px;
                                            opacity:.65;
                                            margin-top:2px;
                                            overflow:hidden;
                                            text-overflow:ellipsis;
                                            white-space:nowrap;
                                        "
                                    >
                                        ${escapeHTML(
                                            profile.full_name
                                        )}
                                    </div>
                                  `
                                : ""
                        }

                    </div>


                    <button
                        type="button"
                        class="send-group-invite-button"
                        data-user-id="${escapeHTML(profile.id)}"
                        ${
                            alreadyInvited
                                ? "disabled"
                                : ""
                        }
                        style="
                            border:none;
                            border-radius:9px;
                            padding:9px 13px;
                            cursor:${    
                                alreadyInvited
                                    ? "default"
                                    : "pointer"
                            };
                            font-weight:700;
                            background:${    
                                alreadyInvited
                                    ? "#eee"
                                    : "#111"
                            };
                            color:${    
                                alreadyInvited
                                    ? "#777"
                                    : "#fff"
                            };
                        "
                    >
                        ${
                            alreadyInvited
                                ? "Invited"
                                : "Invite"
                        }
                    </button>

                `;


                const inviteButton =
                    row.querySelector(
                        ".send-group-invite-button"
                    );


                if (
                    inviteButton &&
                    !alreadyInvited
                ) {

                    inviteButton.addEventListener(
                        "click",
                        async () => {

                            await sendGroupInvitation(
                                currentInviteGroup,
                                profile,
                                inviteButton
                            );

                        }
                    );
                }


                results.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "❌ Unexpected user search error:",
            error
        );


        results.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:25px;
                "
            >
                ❌ Unexpected search error.
            </div>
        `;
    }
}


// =========================================================
// SEND GROUP INVITATION
// =========================================================

async function sendGroupInvitation(
    group,
    profile,
    button
) {

    console.log(
        "📩 Sending group invitation:",
        {
            groupId: group?.id,
            invitedUserId: profile?.id
        }
    );


    if (
        !groupsSupabase ||
        !group ||
        !profile
    ) {
        return;
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        showGroupInviteMessage(
            "Please log in first.",
            "error"
        );

        return;
    }


    if (
        String(group.owner_id).trim() !==
        String(currentGroupUser.id).trim()
    ) {

        showGroupInviteMessage(
            "Only the group owner can send invitations.",
            "error"
        );

        return;
    }


    if (
        String(profile.id) ===
        String(currentGroupUser.id)
    ) {

        showGroupInviteMessage(
            "You cannot invite yourself.",
            "error"
        );

        return;
    }


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Sending...";
    }


    try {

        const {
            data: existingMember,
            error: memberCheckError
        } =
            await groupsSupabase
                .from("group_members")
                .select(
                    "group_id"
                )
                .eq(
                    "group_id",
                    group.id
                )
                .eq(
                    "user_id",
                    profile.id
                )
                .maybeSingle();


        if (memberCheckError) {

            console.error(
                "❌ Member check error:",
                memberCheckError
            );

            throw new Error(
                "Could not check membership."
            );
        }


        if (existingMember) {

            showGroupInviteMessage(
                "This user is already a member of the group.",
                "error"
            );

            if (button) {

                button.disabled =
                    true;

                button.textContent =
                    "Member";
            }

            return;
        }


        const {
            data: existingInvite,
            error: inviteCheckError
        } =
            await groupsSupabase
                .from("group_invitations")
                .select(
                    "id, status"
                )
                .eq(
                    "group_id",
                    group.id
                )
                .eq(
                    "invited_user_id",
                    profile.id
                )
                .eq(
                    "status",
                    "pending"
                )
                .maybeSingle();


        if (inviteCheckError) {

            console.error(
                "❌ Invitation check error:",
                inviteCheckError
            );

            throw new Error(
                "Could not check existing invitation."
            );
        }


        if (existingInvite) {

            showGroupInviteMessage(
                "An invitation has already been sent to this user.",
                "error"
            );

            if (button) {

                button.disabled =
                    true;

                button.textContent =
                    "Invited";
            }

            return;
        }


        const {
            data: invitation,
            error: invitationError
        } =
            await groupsSupabase
                .from("group_invitations")
                .insert({

                    group_id:
                        group.id,

                    inviter_id:
                        currentGroupUser.id,

                    invited_user_id:
                        profile.id,

                    status:
                        "pending"

                })
                .select()
                .single();


        if (invitationError) {

            console.error(
                "❌ Create invitation error:",
                invitationError
            );


            if (
                invitationError.code ===
                "23505"
            ) {

                showGroupInviteMessage(
                    "This user has already been invited.",
                    "error"
                );

                if (button) {

                    button.disabled =
                        true;

                    button.textContent =
                        "Invited";
                }

                return;
            }


            throw new Error(
                invitationError.message
            );
        }


        console.log(
            "✅ Invitation created:",
            invitation
        );


        const notificationMessage =
            `📩 You have been invited to join "${group.name}" on SocialWiki.`;


        const {
            error: notificationError
        } =
            await groupsSupabase
                .from("notifications")
                .insert({

                    receiver_id:
                        profile.id,

                    sender_id:
                        currentGroupUser.id,

                    type:
                        "group_invite",

                    message:
                        notificationMessage,

                    is_read:
                        false,

                    group_invitation_id:
                        invitation.id

                });


        if (notificationError) {

            console.error(
                "❌ Notification creation error:",
                notificationError
            );


            await groupsSupabase
                .from("group_invitations")
                .delete()
                .eq(
                    "id",
                    invitation.id
                )
                .eq(
                    "inviter_id",
                    currentGroupUser.id
                );


            throw new Error(
                "Invitation was not sent because notification creation failed: " +
                notificationError.message
            );
        }


        console.log(
            "🔔 Group invitation notification created"
        );


        showGroupInviteMessage(
            `Invitation sent to @${profile.username || "user"}!`,
            "success"
        );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Invited";

            button.style.background =
                "#eee";

            button.style.color =
                "#777";
        }


    } catch (error) {

        console.error(
            "❌ Unexpected send invitation error:",
            error
        );


        showGroupInviteMessage(
            error.message ||
            "Could not send invitation.",
            "error"
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Invite";
        }
    }
}


// =========================================================
// ACCEPT GROUP INVITATION
// =========================================================

async function acceptGroupInvitation(
    invitationId
) {

    console.log(
        "✅ Accepting group invitation:",
        invitationId
    );


    if (!groupsSupabase) {

        return {
            success: false,
            message:
                "Supabase unavailable."
        };
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        return {
            success: false,
            message:
                "You must be logged in."
        };
    }


    try {

        const {
            data: invitation,
            error: invitationError
        } =
            await groupsSupabase
                .from("group_invitations")
                .select(
                    "id, group_id, invited_user_id, status"
                )
                .eq(
                    "id",
                    invitationId
                )
                .eq(
                    "invited_user_id",
                    currentGroupUser.id
                )
                .maybeSingle();


        if (invitationError) {

            console.error(
                "❌ Load invitation error:",
                invitationError
            );

            return {
                success: false,
                message:
                    invitationError.message
            };
        }


        if (!invitation) {

            return {
                success: false,
                message:
                    "Invitation not found."
            };
        }


        if (
            invitation.status !==
            "pending"
        ) {

            return {
                success: false,
                message:
                    "This invitation has already been processed."
            };
        }


        const {
            data: existingMember,
            error: memberCheckError
        } =
            await groupsSupabase
                .from("group_members")
                .select(
                    "group_id"
                )
                .eq(
                    "group_id",
                    invitation.group_id
                )
                .eq(
                    "user_id",
                    currentGroupUser.id
                )
                .maybeSingle();


        if (memberCheckError) {

            return {
                success: false,
                message:
                    memberCheckError.message
            };
        }


        if (!existingMember) {

            const {
                error: insertMemberError
            } =
                await groupsSupabase
                    .from("group_members")
                    .insert({

                        group_id:
                            invitation.group_id,

                        user_id:
                            currentGroupUser.id,

                        role:
                            "member"

                    });


            if (insertMemberError) {

                if (
                    insertMemberError.code !==
                    "23505"
                ) {

                    console.error(
                        "❌ Accept membership error:",
                        insertMemberError
                    );

                    return {
                        success: false,
                        message:
                            insertMemberError.message
                    };
                }
            }
        }


        const {
            error: updateInvitationError
        } =
            await groupsSupabase
                .from("group_invitations")
                .update({

                    status:
                        "accepted"

                })
                .eq(
                    "id",
                    invitationId
                )
                .eq(
                    "invited_user_id",
                    currentGroupUser.id
                );


        if (updateInvitationError) {

            console.error(
                "❌ Update invitation error:",
                updateInvitationError
            );

            return {
                success: false,
                message:
                    updateInvitationError.message
            };
        }


        console.log(
            "🎉 Group invitation accepted"
        );


        return {
            success: true,
            message:
                "You joined the group successfully!"
        };


    } catch (error) {

        console.error(
            "❌ Unexpected accept invitation error:",
            error
        );


        return {
            success: false,
            message:
                error.message ||
                "Could not accept invitation."
        };
    }
}


// =========================================================
// DECLINE GROUP INVITATION
// =========================================================

async function declineGroupInvitation(
    invitationId
) {

    console.log(
        "❌ Declining group invitation:",
        invitationId
    );


    if (!groupsSupabase) {

        return {
            success: false,
            message:
                "Supabase unavailable."
        };
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        return {
            success: false,
            message:
                "You must be logged in."
        };
    }


    try {

        const {
            data,
            error
        } =
            await groupsSupabase
                .from("group_invitations")
                .update({

                    status:
                        "declined"

                })
                .eq(
                    "id",
                    invitationId
                )
                .eq(
                    "invited_user_id",
                    currentGroupUser.id
                )
                .eq(
                    "status",
                    "pending"
                )
                .select()
                .maybeSingle();


        if (error) {

            console.error(
                "❌ Decline invitation error:",
                error
            );

            return {
                success: false,
                message:
                    error.message
            };
        }


        if (!data) {

            return {
                success: false,
                message:
                    "Invitation not found or already processed."
            };
        }


        console.log(
            "✅ Group invitation declined"
        );


        return {
            success: true,
            message:
                "Invitation declined."
        };


    } catch (error) {

        console.error(
            "❌ Unexpected decline invitation error:",
            error
        );


        return {
            success: false,
            message:
                error.message ||
                "Could not decline invitation."
        };
    }
}


// =========================================================
// MAKE GROUP FUNCTIONS GLOBAL
// =========================================================

window.acceptGroupInvitation =
    acceptGroupInvitation;

window.declineGroupInvitation =
    declineGroupInvitation;

window.openGroupInviteModal =
    openGroupInviteModal;

window.openGroupMembersModal =
    openGroupMembersModal;

window.removeGroupMember =
    removeGroupMember;


// =========================================================
// OPEN CREATE MODAL
// =========================================================

function openCreateGroupModal() {

    console.log(
        "🟢 Opening Create Group modal"
    );

    if (!createGroupModal) {
        return;
    }

    hideGroupMessage();

    createGroupModal.hidden =
        false;

    createGroupModal.classList.add(
        "active"
    );

    createGroupModal.style.display =
        "flex";

    document.body.style.overflow =
        "hidden";

    setTimeout(() => {

        if (groupNameInput) {
            groupNameInput.focus();
        }

    }, 100);
}


// =========================================================
// CLOSE CREATE MODAL
// =========================================================

function closeCreateGroupModal() {

    console.log(
        "🔴 Closing Create Group modal"
    );

    if (!createGroupModal) {
        return;
    }

    createGroupModal.hidden =
        true;

    createGroupModal.classList.remove(
        "active"
    );

    createGroupModal.style.display =
        "";

    document.body.style.overflow =
        "";

    hideGroupMessage();
}


// =========================================================
// OPEN EDIT MODAL
// =========================================================

function openEditGroupModal(
    group
) {

    console.log(
        "✏️ Opening Edit Group:",
        group
    );

    if (
        !editGroupModal ||
        !group
    ) {

        console.error(
            "❌ Edit modal or group missing"
        );

        return;
    }

    editingGroupId =
        group.id;

    hideEditGroupMessage();


    if (editGroupNameInput) {

        editGroupNameInput.value =
            group.name || "";
    }


    if (editGroupDescriptionInput) {

        editGroupDescriptionInput.value =
            group.description || "";
    }


    if (editGroupPrivacySelect) {

        editGroupPrivacySelect.value =
            group.privacy === "private"
                ? "private"
                : "public";
    }


    if (editGroupCoverPreview) {

        if (group.cover_url) {

            editGroupCoverPreview.src =
                group.cover_url;

            editGroupCoverPreview.style.background =
                "";

        } else {

            editGroupCoverPreview.removeAttribute(
                "src"
            );

            editGroupCoverPreview.style.background =
                "linear-gradient(135deg,#ddd,#f5f5f5)";
        }


        editGroupCoverPreview.onerror =
            function () {

                this.onerror =
                    null;

                this.removeAttribute(
                    "src"
                );

                this.style.background =
                    "linear-gradient(135deg,#ddd,#f5f5f5)";
            };
    }


    if (editGroupAvatarPreview) {

        if (group.avatar_url) {

            editGroupAvatarPreview.src =
                group.avatar_url;

            editGroupAvatarPreview.style.background =
                "";

        } else {

            editGroupAvatarPreview.removeAttribute(
                "src"
            );

            editGroupAvatarPreview.style.background =
                "linear-gradient(135deg,#ddd,#f5f5f5)";
        }


        editGroupAvatarPreview.onerror =
            function () {

                this.onerror =
                    null;

                this.removeAttribute(
                    "src"
                );

                this.style.background =
                    "linear-gradient(135deg,#ddd,#f5f5f5)";
            };
    }


    if (editGroupCoverFileInput) {
        editGroupCoverFileInput.value = "";
    }

    if (editGroupAvatarFileInput) {
        editGroupAvatarFileInput.value = "";
    }


    editGroupModal.hidden =
        false;

    editGroupModal.classList.add(
        "active"
    );

    editGroupModal.style.display =
        "flex";

    document.body.style.overflow =
        "hidden";


    console.log(
        "✅ Edit Group Modal opened"
    );


    setTimeout(() => {

        if (editGroupNameInput) {
            editGroupNameInput.focus();
        }

    }, 100);
}


// =========================================================
// CLOSE EDIT MODAL
// =========================================================

function closeEditGroupModalFunction() {

    console.log(
        "🔴 Closing Edit Group modal"
    );

    if (!editGroupModal) {
        return;
    }

    editGroupModal.hidden =
        true;

    editGroupModal.classList.remove(
        "active"
    );

    editGroupModal.style.display =
        "";

    editingGroupId =
        null;

    document.body.style.overflow =
        "";

    hideEditGroupMessage();


    if (editGroupCoverFileInput) {
        editGroupCoverFileInput.value =
            "";
    }

    if (editGroupAvatarFileInput) {
        editGroupAvatarFileInput.value =
            "";
    }
}


// =========================================================
// CURRENT USER
// =========================================================

async function getCurrentGroupUser() {

    if (!groupsSupabase) {
        return null;
    }

    try {

        const {
            data,
            error
        } =
            await groupsSupabase.auth.getUser();


        if (error) {

            console.error(
                "❌ getUser error:",
                error
            );

            return null;
        }


        if (
            !data ||
            !data.user
        ) {

            console.warn(
                "⚠️ No logged-in user"
            );

            return null;
        }


        console.log(
            "👤 Current group user:",
            data.user.id
        );


        return data.user;

    } catch (error) {

        console.error(
            "❌ Unexpected getUser error:",
            error
        );

        return null;
    }
}


// =========================================================
// LOAD GROUPS - المعدل (يظهر العامة + الخاصة للمالك)
// =========================================================

async function loadGroups() {

    console.log(
        "👥 Loading groups..."
    );

    if (!groupsSupabase) {

        renderEmptyGroups(
            "Supabase connection is unavailable."
        );

        return;
    }


    try {

        // جلب المستخدم الحالي
        if (!currentGroupUser) {

            currentGroupUser =
                await getCurrentGroupUser();

        }


        let query =
            groupsSupabase
                .from("groups")
                .select(`
                    id,
                    name,
                    description,
                    owner_id,
                    privacy,
                    created_at,
                    cover_url,
                    avatar_url
                `);


        // إذا كان المستخدم مسجل الدخول
        if (currentGroupUser) {

            // نجلب المجموعات العامة + المجموعات الخاصة التي يملكها المستخدم
            query = query.or(
                `privacy.eq.public, and(privacy.eq.private, owner_id.eq.${currentGroupUser.id})`
            );

        } else {

            // فقط العامة للمستخدمين غير المسجلين
            query = query.eq(
                "privacy",
                "public"
            );

        }


        const {
            data,
            error
        } =
            await query.order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "❌ Loading groups error:",
                error
            );

            renderEmptyGroups(
                "Unable to load groups."
            );

            return;
        }


        allGroups =
            data || [];


        console.log(
            "✅ Groups loaded:",
            allGroups
        );


        await renderGroups(
            allGroups
        );

    } catch (error) {

        console.error(
            "❌ Unexpected load groups error:",
            error
        );

        renderEmptyGroups(
            "Unexpected error while loading groups."
        );
    }
}


// =========================================================
// LOAD JOINED GROUPS
// =========================================================

async function loadJoinedGroups() {

    if (
        !groupsSupabase ||
        !currentGroupUser
    ) {
        return [];
    }


    try {

        const {
            data,
            error
        } =
            await groupsSupabase
                .from("group_members")
                .select(
                    "group_id"
                )
                .eq(
                    "user_id",
                    currentGroupUser.id
                );


        if (error) {

            console.error(
                "❌ Joined groups error:",
                error
            );

            return [];
        }


        return data || [];

    } catch (error) {

        console.error(
            "❌ Unexpected joined groups error:",
            error
        );

        return [];
    }
}


// =========================================================
// MEMBERS COUNT
// =========================================================

async function getMembersCount(
    groupId
) {

    if (!groupsSupabase) {
        return 0;
    }


    try {

        const {
            count,
            error
        } =
            await groupsSupabase
                .from("group_members")
                .select(
                    "*",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "group_id",
                    groupId
                );


        if (error) {

            console.error(
                "❌ Members count error:",
                error
            );

            return 0;
        }


        return count || 0;

    } catch (error) {

        console.error(
            "❌ Unexpected members count error:",
            error
        );

        return 0;
    }
}


// =========================================================
// RENDER GROUPS
// =========================================================

async function renderGroups(
    groups
) {

    if (!groupsGrid) {
        return;
    }


    if (
        !groups ||
        groups.length === 0
    ) {

        renderEmptyGroups(
            "No communities found."
        );

        return;
    }


    const joinedGroups =
        await loadJoinedGroups();


    const joinedIds =
        new Set(
            joinedGroups.map(
                item =>
                    item.group_id
            )
        );


    groupsGrid.innerHTML =
        "";


    for (
        const group of groups
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "group-card";


        const description =
            group.description &&
            group.description.trim()
                ? group.description
                : "Welcome to this SocialWiki community.";


        const cover =
            group.cover_url ||
            "";


        const avatar =
            group.avatar_url ||
            "";


        const isJoined =
            joinedIds.has(
                group.id
            );


        const isOwner =
            currentGroupUser &&
            String(group.owner_id).trim() ===
            String(currentGroupUser.id).trim();


        const membersCount =
            await getMembersCount(
                group.id
            );


        card.innerHTML = `

            <div class="group-cover">

                ${
                    cover
                        ? `
                            <img
                                src="${escapeHTML(cover)}"
                                alt="${escapeHTML(group.name)} cover"
                            >
                          `
                        : `
                            <div
                                class="group-cover-placeholder"
                            ></div>
                          `
                }

                <div class="group-avatar">

                    ${
                        avatar
                            ? `
                                <img
                                    src="${escapeHTML(avatar)}"
                                    alt="${escapeHTML(group.name)} avatar"
                                >
                              `
                            : `
                                <div
                                    class="group-avatar-placeholder"
                                >
                                    👥
                                </div>
                              `
                    }

                </div>

            </div>


            <div class="group-content">

                <div class="group-title-row">

                    <h3>
                        ${escapeHTML(group.name)}
                    </h3>

                    ${
                        isOwner
                            ? `
                                <button
                                    type="button"
                                    class="edit-group-button"
                                    data-group-id="${escapeHTML(group.id)}"
                                >
                                    ✏️ Edit
                                </button>
                              `
                            : ""
                    }

                </div>


                <p class="group-description">
                    ${escapeHTML(description)}
                </p>


                <div class="group-meta">

                    <span>
                        🌐 Public
                    </span>

                    <span>
                        👥 ${membersCount}
                        ${
                            membersCount === 1
                                ? "member"
                                : "members"
                        }
                    </span>

                </div>


                <div
                    class="group-action-buttons"
                    style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:8px;
                        margin-top:12px;
                    "
                >

                    <button
                        type="button"
                        class="view-members-button"
                        data-group-id="${escapeHTML(group.id)}"
                        style="
                            border:1px solid #ddd;
                            background:#fff;
                            color:#222;
                            border-radius:8px;
                            padding:9px 12px;
                            cursor:pointer;
                            font-weight:600;
                        "
                    >
                        👥 Members
                    </button>

                    <button
                        type="button"
                        class="open-group-button"
                        data-group-id="${escapeHTML(group.id)}"
                        style="
                            border:none;
                            background:#111;
                            color:#fff;
                            border-radius:8px;
                            padding:9px 12px;
                            cursor:pointer;
                            font-weight:600;
                        "
                    >
                        📝 Open Group
                    </button>

                    ${
                        isOwner
                            ? `
                                <button
                                    type="button"
                                    class="invite-people-button"
                                    data-group-id="${escapeHTML(group.id)}"
                                    style="
                                        border:none;
                                        background:#111;
                                        color:#fff;
                                        border-radius:8px;
                                        padding:9px 12px;
                                        cursor:pointer;
                                        font-weight:600;
                                    "
                                >
                                    📩 Invite People
                                </button>
                              `
                            : ""
                    }

                </div>


                <div
                    style="
                        margin-top:10px;
                    "
                >

                    ${
                        isOwner
                            ? `
                                <button
                                    type="button"
                                    class="join-group-button joined"
                                    disabled
                                >
                                    Owner
                                </button>
                              `
                            : `
                                <button
                                    type="button"
                                    class="join-group-button ${
                                        isJoined
                                            ? "joined"
                                            : ""
                                    }"
                                    data-group-id="${escapeHTML(group.id)}"
                                >
                                    ${
                                        isJoined
                                            ? "Joined"
                                            : "Join Group"
                                    }
                                </button>
                              `
                    }

                </div>

            </div>
        `;


        // =====================================================
        // EDIT BUTTON
        // =====================================================

        const editButton =
            card.querySelector(
                ".edit-group-button"
            );


        if (editButton) {

            editButton.addEventListener(
                "click",
                () => {

                    openEditGroupModal(
                        group
                    );

                }
            );
        }


        // =====================================================
        // MEMBERS BUTTON
        // =====================================================

        const membersButton =
            card.querySelector(
                ".view-members-button"
            );


        if (membersButton) {

            membersButton.addEventListener(
                "click",
                () => {

                    openGroupMembersModal(
                        group
                    );

                }
            );
        }


        // =====================================================
        // OPEN GROUP BUTTON
        // =====================================================

        const openGroupButton =
            card.querySelector(
                ".open-group-button"
            );


        if (openGroupButton) {

            openGroupButton.addEventListener(
                "click",
                () => {

                    openGroupPage(
                        group
                    );

                }
            );
        }


        // =====================================================
        // INVITE BUTTON
        // =====================================================

        const inviteButton =
            card.querySelector(
                ".invite-people-button"
            );


        if (inviteButton) {

            inviteButton.addEventListener(
                "click",
                () => {

                    openGroupInviteModal(
                        group
                    );

                }
            );
        }


        // =====================================================
        // JOIN BUTTON
        // =====================================================

        const joinButton =
            card.querySelector(
                ".join-group-button:not([disabled])"
            );


        if (joinButton) {

            joinButton.addEventListener(
                "click",
                () => {

                    joinGroup(
                        group.id,
                        joinButton
                    );

                }
            );
        }


        groupsGrid.appendChild(
            card
        );
    }
}


// =========================================================
// OPEN GROUP PAGE
// =========================================================

function openGroupPage(
    group
) {

    console.log(
        "📝 Opening group page:",
        group
    );

    // يمكنك تخصيص هذه الدالة حسب احتياجاتك
    // مثلاً: window.location.href = `/group.html?id=${group.id}`;


    // مؤقتاً: تنبيه
    alert(
        `📝 Opening group: ${group.name}\nID: ${group.id}`
    );
}


// =========================================================
// DELETE GROUP POST
// =========================================================

async function deleteGroupPost(
    postId,
    groupId,
    button
) {

    console.log(
        "🗑️ DELETE GROUP POST:",
        postId
    );

    if (!groupsSupabase) {

        alert(
            "Supabase connection is unavailable."
        );

        return;
    }

    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }

    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return;
    }

    if (button) {

        button.disabled = true;

        button.textContent =
            "Deleting...";
    }

    try {

        // =================================================
        // GET POST
        // =================================================

        const {
            data: post,
            error: postError
        } =
            await groupsSupabase
                .from("group_posts")
                .select(`
                    id,
                    group_id,
                    user_id
                `)
                .eq(
                    "id",
                    postId
                )
                .single();

        if (postError) {

            console.error(
                "❌ Load post error:",
                postError
            );

            alert(
                "Could not find this post."
            );

            return;
        }

        // =================================================
        // GET GROUP OWNER
        // =================================================

        const {
            data: group,
            error: groupError
        } =
            await groupsSupabase
                .from("groups")
                .select(`
                    id,
                    owner_id
                `)
                .eq(
                    "id",
                    post.group_id
                )
                .single();

        if (groupError) {

            console.error(
                "❌ Load group error:",
                groupError
            );

            alert(
                "Could not verify group permissions."
            );

            return;
        }

        // =================================================
        // CHECK OWNER
        // =================================================

        const isOwner =
            String(group.owner_id) ===
            String(currentGroupUser.id);

        // =================================================
        // CHECK ADMIN
        // =================================================

        let isAdmin = false;

        if (!isOwner) {

            const {
                data: membership,
                error: membershipError
            } =
                await groupsSupabase
                    .from("group_members")
                    .select("role")
                    .eq(
                        "group_id",
                        post.group_id
                    )
                    .eq(
                        "user_id",
                        currentGroupUser.id
                    )
                    .maybeSingle();

            if (membershipError) {

                console.error(
                    "❌ Membership check error:",
                    membershipError
                );

                alert(
                    "Could not verify your group role."
                );

                return;
            }

            isAdmin =
                membership?.role ===
                "admin";
        }

        // =================================================
        // CHECK POST OWNER
        // =================================================

        const isPostOwner =
            String(post.user_id) ===
            String(currentGroupUser.id);

        // =================================================
        // PERMISSION
        // =================================================

        if (
            !isOwner &&
            !isAdmin &&
            !isPostOwner
        ) {

            alert(
                "You do not have permission to delete this post."
            );

            return;
        }

        // =================================================
        // CONFIRM
        // =================================================

        const confirmed =
            confirm(
                "Are you sure you want to delete this post?"
            );

        if (!confirmed) {

            return;
        }

        // =================================================
        // DELETE
        // =================================================

        const {
            error: deleteError
        } =
            await groupsSupabase
                .from("group_posts")
                .delete()
                .eq(
                    "id",
                    postId
                );

        if (deleteError) {

            console.error(
                "❌ Delete group post error:",
                deleteError
            );

            alert(
                "Could not delete post: " +
                deleteError.message
            );

            return;
        }

        console.log(
            "✅ Group post deleted:",
            postId
        );

        // =================================================
        // RELOAD POSTS
        // =================================================

        await loadGroupPosts(
            groupId
        );

    } catch (error) {

        console.error(
            "❌ Unexpected delete group post error:",
            error
        );

        alert(
            "Could not delete post: " +
            (
                error.message ||
                "Unexpected error."
            )
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Delete";
        }
    }
}


// =========================================================
// EMPTY STATE
// =========================================================

function renderEmptyGroups(
    message
) {

    if (!groupsGrid) {
        return;
    }

    groupsGrid.innerHTML = `

        <div class="groups-empty">

            <div class="groups-empty-icon">
                👥
            </div>

            <h2>
                No communities found
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>
    `;
}


// =========================================================
// CREATE GROUP
// =========================================================

async function createGroup() {

    console.log(
        "🚀 Starting createGroup()"
    );


    if (!groupsSupabase) {

        showGroupMessage(
            "Supabase connection is unavailable.",
            "error"
        );

        return;
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        showGroupMessage(
            "You must be logged in to create a group.",
            "error"
        );

        return;
    }


    const name =
        groupNameInput
            ? groupNameInput.value.trim()
            : "";


    const description =
        groupDescriptionInput
            ? groupDescriptionInput.value.trim()
            : "";


    const privacy =
        groupPrivacySelect
            ? groupPrivacySelect.value
            : "public";


    if (!name) {

        showGroupMessage(
            "Please enter a group name.",
            "error"
        );

        return;
    }


    if (name.length < 2) {

        showGroupMessage(
            "Group name must contain at least 2 characters.",
            "error"
        );

        return;
    }


    const finalPrivacy =
        privacy === "private"
            ? "private"
            : "public";


    if (saveGroupButton) {

        saveGroupButton.disabled =
            true;

        saveGroupButton.textContent =
            "Creating...";
    }


    hideGroupMessage();


    try {

        const {
            data: newGroup,
            error: groupError
        } =
            await groupsSupabase
                .from("groups")
                .insert({

                    name: name,

                    description:
                        description,

                    owner_id:
                        currentGroupUser.id,

                    privacy:
                        finalPrivacy,

                    cover_url:
                        null,

                    avatar_url:
                        null

                })
                .select()
                .single();


        if (groupError) {

            console.error(
                "❌ Create group error:",
                groupError
            );

            showGroupMessage(
                "Could not create group: " +
                groupError.message,
                "error"
            );

            return;
        }


        const {
            error: memberError
        } =
            await groupsSupabase
                .from("group_members")
                .insert({

                    group_id:
                        newGroup.id,

                    user_id:
                        currentGroupUser.id,

                    role:
                        "owner"

                });


        if (memberError) {

            console.error(
                "❌ Owner membership error:",
                memberError
            );

            showGroupMessage(
                "Group created, but adding you as owner failed: " +
                memberError.message,
                "error"
            );

            await loadGroups();

            return;
        }


        showGroupMessage(
            "Group created successfully!",
            "success"
        );


        if (createGroupForm) {
            createGroupForm.reset();
        }


        await loadGroups();


        setTimeout(
            () => {

                closeCreateGroupModal();

            },
            700
        );


    } catch (error) {

        console.error(
            "❌ Unexpected create group error:",
            error
        );

        showGroupMessage(
            "Unexpected error: " +
            error.message,
            "error"
        );


    } finally {

        if (saveGroupButton) {

            saveGroupButton.disabled =
                false;

            saveGroupButton.textContent =
                "Create Group";
        }
    }
}


// =========================================================
// JOIN GROUP
// =========================================================

async function joinGroup(
    groupId,
    button
) {

    console.log(
        "👥 Joining group:",
        groupId
    );


    if (!groupsSupabase) {

        alert(
            "Supabase connection is unavailable."
        );

        return;
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return;
    }


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Checking...";
    }


    try {

        const {
            data: existingMember,
            error: checkError
        } =
            await groupsSupabase
                .from("group_members")
                .select("group_id")
                .eq(
                    "group_id",
                    groupId
                )
                .eq(
                    "user_id",
                    currentGroupUser.id
                )
                .maybeSingle();


        if (checkError) {

            console.error(
                "❌ Membership check error:",
                checkError
            );

            alert(
                "Could not check group membership: " +
                checkError.message
            );

            return;
        }


        if (existingMember) {

            console.log(
                "ℹ️ User is already a member"
            );


            if (button) {

                button.textContent =
                    "Joined";

                button.classList.add(
                    "joined"
                );
            }


            return;
        }


        if (button) {

            button.textContent =
                "Joining...";
        }


        const {
            error
        } =
            await groupsSupabase
                .from("group_members")
                .insert({

                    group_id:
                        groupId,

                    user_id:
                        currentGroupUser.id,

                    role:
                        "member"

                });


        if (error) {

            console.error(
                "❌ Join group error:",
                error
            );


            if (
                error.code === "23505" ||
                String(error.message)
                    .toLowerCase()
                    .includes("duplicate")
            ) {

                if (button) {

                    button.textContent =
                        "Joined";

                    button.classList.add(
                        "joined"
                    );
                }


                return;
            }


            alert(
                "Could not join group: " +
                error.message
            );

            return;
        }


        console.log(
            "✅ Joined group"
        );


        if (button) {

            button.textContent =
                "Joined";

            button.classList.add(
                "joined"
            );
        }


    } catch (error) {

        console.error(
            "❌ Unexpected join error:",
            error
        );


        alert(
            "Could not join group: " +
            error.message
        );


    } finally {

        if (button) {

            button.disabled =
                false;
        }
    }
}


// =========================================================
// UPLOAD GROUP IMAGE
// =========================================================

async function uploadGroupImage(
    file,
    groupId,
    type
) {

    console.log(
        "📤 Uploading group image:",
        {
            groupId: groupId,
            type: type,
            fileName: file
                ? file.name
                : null
        }
    );


    if (!groupsSupabase) {

        showEditGroupMessage(
            "Supabase connection is unavailable.",
            "error"
        );

        return null;
    }


    if (!file) {

        showEditGroupMessage(
            "Please select an image.",
            "error"
        );

        return null;
    }


    if (
        ![
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ].includes(file.type)
    ) {

        showEditGroupMessage(
            "Please choose a JPG, PNG, WEBP or GIF image.",
            "error"
        );

        return null;
    }


    const maxSize =
        5 * 1024 * 1024;


    if (file.size > maxSize) {

        showEditGroupMessage(
            "Image must be smaller than 5 MB.",
            "error"
        );

        return null;
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        showEditGroupMessage(
            "You must be logged in.",
            "error"
        );

        return null;
    }


    try {

        const {
            data: ownerGroup,
            error: ownerError
        } =
            await groupsSupabase
                .from("groups")
                .select(
                    "id, owner_id"
                )
                .eq(
                    "id",
                    groupId
                )
                .single();


        if (ownerError) {

            console.error(
                "❌ Group owner verification error:",
                ownerError
            );

            showEditGroupMessage(
                "Could not verify group ownership.",
                "error"
            );

            return null;
        }


        if (
            !ownerGroup ||
            String(ownerGroup.owner_id).trim() !==
            String(currentGroupUser.id).trim()
        ) {

            showEditGroupMessage(
                "You are not allowed to upload images for this group.",
                "error"
            );

            return null;
        }


        let extension =
            "jpg";


        if (
            file.type ===
            "image/png"
        ) {

            extension =
                "png";

        } else if (
            file.type ===
            "image/webp"
        ) {

            extension =
                "webp";

        } else if (
            file.type ===
            "image/gif"
        ) {

            extension =
                "gif";
        }


        const filePath =
            groupId +
            "/" +
            type +
            "." +
            extension;


        console.log(
            "📁 Storage path:",
            filePath
        );


        const {
            error: uploadError
        } =
            await groupsSupabase.storage
                .from("group-images")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            true,

                        contentType:
                            file.type
                    }
                );

        if (uploadError) {

            console.error(
                "❌ Group image upload error:",
                uploadError
            );

            showEditGroupMessage(
                "Upload failed: " +
                uploadError.message,
                "error"
            );

            return null;
        }


        const {
            data: publicUrlData
        } =
            groupsSupabase.storage
                .from("group-images")
                .getPublicUrl(
                    filePath
                );


        const publicUrl =
            publicUrlData &&
            publicUrlData.publicUrl
                ? publicUrlData.publicUrl
                : null;


        if (!publicUrl) {

            showEditGroupMessage(
                "Image uploaded but public URL could not be created.",
                "error"
            );

            return null;
        }


        const updateData = {};


        if (type === "cover") {

            updateData.cover_url =
                publicUrl;

        } else if (
            type === "avatar"
        ) {

            updateData.avatar_url =
                publicUrl;

        } else {

            return null;
        }


        const {
            error: databaseError
        } =
            await groupsSupabase
                .from("groups")
                .update(
                    updateData
                )
                .eq(
                    "id",
                    groupId
                );


        if (databaseError) {

            console.error(
                "❌ Group image database update error:",
                databaseError
            );

            showEditGroupMessage(
                "Image uploaded but database update failed: " +
                databaseError.message,
                "error"
            );

            return null;
        }


        const previewUrl =
            publicUrl +
            "?t=" +
            Date.now();


        if (
            type === "cover" &&
            editGroupCoverPreview
        ) {

            editGroupCoverPreview.style.background =
                "";

            editGroupCoverPreview.src =
                previewUrl;
        }


        if (
            type === "avatar" &&
            editGroupAvatarPreview
        ) {

            editGroupAvatarPreview.style.background =
                "";

            editGroupAvatarPreview.src =
                previewUrl;
        }


        showEditGroupMessage(
            type === "cover"
                ? "Cover photo uploaded successfully!"
                : "Group avatar uploaded successfully!",
            "success"
        );


        const localGroup =
            allGroups.find(
                item =>
                    String(item.id) ===
                    String(groupId)
            );


        if (localGroup) {

            if (type === "cover") {

                localGroup.cover_url =
                    publicUrl;

            } else {

                localGroup.avatar_url =
                    publicUrl;
            }
        }


        console.log(
            "🎉 Group image process completed"
        );


        return publicUrl;

    } catch (error) {

        console.error(
            "❌ Unexpected group image upload error:",
            error
        );

        showEditGroupMessage(
            "Unexpected upload error: " +
            error.message,
            "error"
        );

        return null;
    }
}


// =========================================================
// EDIT COVER UPLOAD BUTTON
// =========================================================

if (editGroupCoverUploadButton) {

    editGroupCoverUploadButton.addEventListener(
        "click",
        () => {

            if (editGroupCoverFileInput) {

                editGroupCoverFileInput.click();

            }
        }
    );
}


// =========================================================
// EDIT COVER FILE INPUT
// =========================================================

if (editGroupCoverFileInput) {

    editGroupCoverFileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files &&
                this.files[0];


            if (!file) {
                return;
            }


            if (!editingGroupId) {

                showEditGroupMessage(
                    "No group selected.",
                    "error"
                );

                return;
            }


            if (editGroupCoverUploadButton) {

                editGroupCoverUploadButton.disabled =
                    true;

                editGroupCoverUploadButton.textContent =
                    "Uploading...";
            }


            await uploadGroupImage(
                file,
                editingGroupId,
                "cover"
            );


            this.value =
                "";


            if (editGroupCoverUploadButton) {

                editGroupCoverUploadButton.disabled =
                    false;

                editGroupCoverUploadButton.textContent =
                    "Upload Cover Photo";
            }
        }
    );
}


// =========================================================
// EDIT AVATAR UPLOAD BUTTON
// =========================================================

if (editGroupAvatarUploadButton) {

    editGroupAvatarUploadButton.addEventListener(
        "click",
        () => {

            if (editGroupAvatarFileInput) {

                editGroupAvatarFileInput.click();

            }
        }
    );
}


// =========================================================
// EDIT AVATAR FILE INPUT
// =========================================================

if (editGroupAvatarFileInput) {

    editGroupAvatarFileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files &&
                this.files[0];


            if (!file) {
                return;
            }


            if (!editingGroupId) {

                showEditGroupMessage(
                    "No group selected.",
                    "error"
                );

                return;
            }


            if (editGroupAvatarUploadButton) {

                editGroupAvatarUploadButton.disabled =
                    true;

                editGroupAvatarUploadButton.textContent =
                    "Uploading...";
            }


            await uploadGroupImage(
                file,
                editingGroupId,
                "avatar"
            );


            this.value =
                "";


            if (editGroupAvatarUploadButton) {

                editGroupAvatarUploadButton.disabled =
                    false;

                editGroupAvatarUploadButton.textContent =
                    "Upload Group Avatar";
            }
        }
    );
}


// =========================================================
// EDIT GROUP
// =========================================================

async function updateGroup() {

    console.log(
        "✏️ Starting updateGroup()"
    );


    if (!groupsSupabase) {

        showEditGroupMessage(
            "Supabase connection is unavailable.",
            "error"
        );

        return;
    }


    if (!editingGroupId) {

        showEditGroupMessage(
            "No group selected.",
            "error"
        );

        return;
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        showEditGroupMessage(
            "You must be logged in.",
            "error"
        );

        return;
    }


    const name =
        editGroupNameInput
            ? editGroupNameInput.value.trim()
            : "";


    const description =
        editGroupDescriptionInput
            ? editGroupDescriptionInput.value.trim()
            : "";


    const privacy =
        editGroupPrivacySelect
            ? editGroupPrivacySelect.value
            : "public";


    if (!name) {

        showEditGroupMessage(
            "Please enter a group name.",
            "error"
        );

        return;
    }


    if (name.length < 2) {

        showEditGroupMessage(
            "Group name must contain at least 2 characters.",
            "error"
        );

        return;
    }


    if (saveEditGroupButton) {

        saveEditGroupButton.disabled =
            true;

        saveEditGroupButton.textContent =
            "Saving...";
    }


    hideEditGroupMessage();


    try {

        const {
            data: ownerGroup,
            error: ownerCheckError
        } =
            await groupsSupabase
                .from("groups")
                .select(
                    "id, owner_id"
                )
                .eq(
                    "id",
                    editingGroupId
                )
                .single();


        if (ownerCheckError) {

            showEditGroupMessage(
                "Could not verify group ownership: " +
                ownerCheckError.message,
                "error"
            );

            return;
        }


        if (
            !ownerGroup ||
            String(ownerGroup.owner_id).trim() !==
            String(currentGroupUser.id).trim()
        ) {

            showEditGroupMessage(
                "You are not allowed to edit this group.",
                "error"
            );

            return;
        }


        const {
            data: updatedGroup,
            error: updateError
        } =
            await groupsSupabase
                .from("groups")
                .update({

                    name:
                        name,

                    description:
                        description,

                    privacy:
                        privacy === "private"
                            ? "private"
                            : "public"

                })
                .eq(
                    "id",
                    editingGroupId
                )
                .select()
                .single();


        if (updateError) {

            showEditGroupMessage(
                "Could not update group: " +
                updateError.message,
                "error"
            );

            return;
        }


        console.log(
            "✅ Group updated:",
            updatedGroup
        );


        showEditGroupMessage(
            "Group updated successfully!",
            "success"
        );


        await loadGroups();


        setTimeout(
            () => {

                closeEditGroupModalFunction();

            },
            700
        );


    } catch (error) {

        console.error(
            "❌ Unexpected update group error:",
            error
        );

        showEditGroupMessage(
            "Unexpected error: " +
            error.message,
            "error"
        );


    } finally {

        if (saveEditGroupButton) {

            saveEditGroupButton.disabled =
                false;

            saveEditGroupButton.textContent =
                "Save Changes";
        }
    }
}


// =========================================================
// SEARCH GROUPS
// =========================================================

function searchGroups(
    value
) {

    const search =
        String(value || "")
            .trim()
            .toLowerCase();


    if (!search) {

        renderGroups(
            allGroups
        );

        return;
    }


    const filtered =
        allGroups.filter(
            group => {

                const name =
                    String(
                        group.name || ""
                    ).toLowerCase();


                const description =
                    String(
                        group.description || ""
                    ).toLowerCase();


                return (
                    name.includes(search) ||
                    description.includes(search)
                );
            }
        );


    renderGroups(
        filtered
    );
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(
    value
) {

    return String(
        value || ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// =========================================================
// CREATE BUTTON
// =========================================================

if (createGroupButton) {

    createGroupButton.addEventListener(
        "click",
        openCreateGroupModal
    );
}


// =========================================================
// CLOSE CREATE MODAL
// =========================================================

if (closeGroupModal) {

    closeGroupModal.addEventListener(
        "click",
        closeCreateGroupModal
    );
}


if (cancelGroupButton) {

    cancelGroupButton.addEventListener(
        "click",
        closeCreateGroupModal
    );
}


if (groupModalOverlay) {

    groupModalOverlay.addEventListener(
        "click",
        closeCreateGroupModal
    );
}


// =========================================================
// CREATE FORM
// =========================================================

if (createGroupForm) {

    createGroupForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await createGroup();

        }
    );
}


// =========================================================
// EDIT MODAL EVENTS
// =========================================================

if (closeEditGroupModal) {

    closeEditGroupModal.addEventListener(
        "click",
        closeEditGroupModalFunction
    );
}


if (cancelEditGroupButton) {

    cancelEditGroupButton.addEventListener(
        "click",
        closeEditGroupModalFunction
    );
}


if (editGroupModalOverlay) {

    editGroupModalOverlay.addEventListener(
        "click",
        closeEditGroupModalFunction
    );
}


// =========================================================
// EDIT FORM
// =========================================================

if (editGroupForm) {

    editGroupForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await updateGroup();

        }
    );
}


// =========================================================
// SEARCH INPUT
// =========================================================

if (groupSearchInput) {

    groupSearchInput.addEventListener(
        "input",
        function () {

            searchGroups(
                this.value
            );

        }
    );
}


// =========================================================
// ESCAPE KEY
// =========================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        if (
            createGroupModal &&
            !createGroupModal.hidden
        ) {

            closeCreateGroupModal();

            return;
        }


        if (
            editGroupModal &&
            !editGroupModal.hidden
        ) {

            closeEditGroupModalFunction();

            return;
        }


        const membersModal =
            document.getElementById(
                "groupMembersModal"
            );


        if (
            membersModal &&
            !membersModal.hidden
        ) {

            closeGroupMembersModal();

            return;
        }


        const inviteModal =
            document.getElementById(
                "groupInviteModal"
            );


        if (
            inviteModal &&
            !inviteModal.hidden
        ) {

            closeGroupInviteModal();
        }
    }
);


// =========================================================
// =========================================================
// LOAD GROUP POSTS
// =========================================================

async function loadGroupPosts(groupId) {

    console.log(
        "📝 Loading group posts:",
        groupId
    );

    if (!groupsSupabase) {

        console.error(
            "❌ Groups Supabase unavailable"
        );

        return [];
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        console.warn(
            "⚠️ No authenticated user"
        );

        return [];
    }


    try {

        // =====================================================
        // LOAD POSTS
        // =====================================================

        const {
            data: posts,
            error: postsError
        } =
            await groupsSupabase
                .from("group_posts")
                .select(`
                    id,
                    content,
                    image_url,
                    created_at,
                    user_id,
                    profiles:user_id (
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq(
                    "group_id",
                    groupId
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (postsError) {

            console.error(
                "❌ Load posts error:",
                postsError
            );

            return [];
        }


        console.log(
            "✅ Posts loaded:",
            posts?.length || 0
        );


        const postList =
            posts || [];


        // =====================================================
        // NO POSTS
        // =====================================================

        if (postList.length === 0) {

            renderGroupPosts(
                [],
                groupId
            );

            return [];
        }


        // =====================================================
        // GET POST IDS
        // =====================================================

        const postIds =
            postList.map(
                post => post.id
            );

            // =====================================================
// LOAD LIKE COUNTS
// =====================================================

const {
    data: likeRows,
    error: likesError
} =
    await groupsSupabase
        .from("group_post_likes")
        .select("post_id")
        .in(
            "post_id",
            postIds
        );

if (likesError) {

    console.error(
        "❌ Load likes error:",
        likesError
    );

}

const likeCountMap = new Map();

(likeRows || []).forEach(
    like => {

        const postId =
            String(like.post_id);

        likeCountMap.set(
            postId,
            (likeCountMap.get(postId) || 0) + 1
        );

    }
);

        // =====================================================
        // LOAD COMMENTS
        // IMPORTANT:
        // We DO NOT use profiles:user_id here.
        // This avoids the Supabase relationship error.
        // =====================================================

        const {
            data: comments,
            error: commentsError
        } =
            await groupsSupabase
                .from("group_post_comments")
                .select(`
                    id,
                    post_id,
                    user_id,
                    content,
                    created_at
                `)
                .in(
                    "post_id",
                    postIds
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (commentsError) {

            console.error(
                "❌ Load comments error:",
                commentsError
            );

        }


        const commentList =
            comments || [];


        console.log(
            "💬 Comments loaded:",
            commentList.length
        );


        // =====================================================
        // GET COMMENT USER IDS
        // =====================================================

        const commentUserIds =
            [
                ...new Set(
                    commentList
                        .map(
                            comment =>
                                comment.user_id
                        )
                        .filter(Boolean)
                )
            ];


        // =====================================================
        // LOAD COMMENT PROFILES
        // =====================================================

        let commentProfiles = [];


        if (
            commentUserIds.length > 0
        ) {

            const {
                data: profiles,
                error: profilesError
            } =
                await groupsSupabase
                    .from("profiles")
                    .select(`
                        id,
                        username,
                        full_name,
                        avatar_url
                    `)
                    .in(
                        "id",
                        commentUserIds
                    );


            if (profilesError) {

                console.error(
                    "❌ Load comment profiles error:",
                    profilesError
                );

            } else {

                commentProfiles =
                    profiles || [];

            }

        }


        // =====================================================
        // CREATE PROFILE MAP
        // =====================================================

        const profileMap =
            new Map();


        commentProfiles.forEach(
            profile => {

                profileMap.set(
                    String(profile.id),
                    profile
                );

            }
        );


        // =====================================================
        // ATTACH PROFILE TO EACH COMMENT
        // =====================================================

        const commentsWithProfiles =
            commentList.map(
                comment => {

                    return {

                        ...comment,

                        profile:
                            profileMap.get(
                                String(
                                    comment.user_id
                                )
                            ) || {}

                    };

                }
            );


        // =====================================================
        // GROUP COMMENTS BY POST
        // =====================================================

        const commentsByPost =
            new Map();


        commentsWithProfiles.forEach(
            comment => {

                const postId =
                    String(
                        comment.post_id
                    );


                if (
                    !commentsByPost.has(
                        postId
                    )
                ) {

                    commentsByPost.set(
                        postId,
                        []
                    );

                }


                commentsByPost
                    .get(postId)
                    .push(comment);

            }
        );


        // =====================================================
        // ADD COMMENTS TO POSTS
        // =====================================================

        const postsWithComments =
            postList.map(
                post => {

                   return {

    ...post,

    likeCount:
        likeCountMap.get(
            String(post.id)
        ) || 0,

    comments:
        commentsByPost.get(
            String(post.id)
        ) || []

};

                }
            );


        console.log(
            "✅ Posts + comments ready:",
            postsWithComments
        );


        // =====================================================
        // RENDER
        // =====================================================

        renderGroupPosts(
            postsWithComments,
            groupId
        );


        return postsWithComments;


    } catch (error) {

        console.error(
            "❌ Unexpected loadGroupPosts error:",
            error
        );

        return [];
    }
}
// =========================================================
// START
// =========================================================
// =========================================================
// =========================================================
// =========================================================
// 🆕 NEW FUNCTIONS FOR GROUP POSTS (DO NOT DELETE)
// =========================================================
// =========================================================
// =========================================================


// =========================================================
// CREATE GROUP POST
// =========================================================

async function createGroupPost(
    groupId,
    content,
    imageFile = null
) {

    console.log(
        "📝 Creating group post:",
        {
            groupId,
            content: content?.substring(0, 50)
        }
    );


    if (!groupsSupabase) {

        alert(
            "Supabase connection is unavailable."
        );

        return {
            success: false,
            message: "Supabase unavailable."
        };
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return {
            success: false,
            message: "You must be logged in."
        };
    }


    if (!content || content.trim().length === 0) {

        alert(
            "Please write something."
        );

        return {
            success: false,
            message: "Content cannot be empty."
        };
    }


    if (content.trim().length > 5000) {

        alert(
            "Post content is too long (max 5000 characters)."
        );

        return {
            success: false,
            message: "Content too long."
        };
    }


    // =====================================================
    // CHECK IF USER IS A MEMBER
    // =====================================================

    try {

        const {
            data: membership,
            error: membershipError
        } =
            await groupsSupabase
                .from("group_members")
                .select("role")
                .eq(
                    "group_id",
                    groupId
                )
                .eq(
                    "user_id",
                    currentGroupUser.id
                )
                .maybeSingle();


        if (membershipError) {

            console.error(
                "❌ Membership check error:",
                membershipError
            );

            alert(
                "Could not verify group membership."
            );

            return {
                success: false,
                message: membershipError.message
            };
        }


        if (!membership) {

            alert(
                "You must be a member of this group to post."
            );

            return {
                success: false,
                message: "Not a member."
            };
        }


        let imageUrl = null;


        // =====================================================
        // UPLOAD IMAGE IF PROVIDED
        // =====================================================

        if (imageFile) {

            const uploadResult =
                await uploadGroupPostImage(
                    imageFile,
                    groupId
                );


            if (uploadResult.success) {

                imageUrl =
                    uploadResult.url;

            } else {

                alert(
                    "Image upload failed: " +
                    uploadResult.message
                );

                return {
                    success: false,
                    message: uploadResult.message
                };
            }
        }


        // =====================================================
        // CREATE POST
        // =====================================================

        const {
            data: newPost,
            error: createError
        } =
            await groupsSupabase
                .from("group_posts")
                .insert({

                    group_id:
                        groupId,

                    user_id:
                        currentGroupUser.id,

                    content:
                        content.trim(),

                    image_url:
                        imageUrl

                })
                .select(`
                    id,
                    content,
                    image_url,
                    created_at,
                    user_id,
                    profiles:user_id (
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .single();


        if (createError) {

            console.error(
                "❌ Create post error:",
                createError
            );

            alert(
                "Could not create post: " +
                createError.message
            );

            return {
                success: false,
                message: createError.message
            };
        }


        console.log(
            "✅ Group post created:",
            newPost
        );


        // =====================================================
        // REFRESH POSTS
        // =====================================================

        await loadGroupPosts(
            groupId
        );


        return {
            success: true,
            data: newPost,
            message: "Post created successfully!"
        };


    } catch (error) {

        console.error(
            "❌ Unexpected create post error:",
            error
        );

        alert(
            "Could not create post: " +
            error.message
        );

        return {
            success: false,
            message: error.message
        };
    }
}


// =========================================================
// UPLOAD GROUP POST IMAGE
// =========================================================

async function uploadGroupPostImage(
    file,
    groupId
) {

    console.log(
        "📤 Uploading post image:",
        {
            groupId,
            fileName: file?.name
        }
    );


    if (!groupsSupabase) {

        return {
            success: false,
            message: "Supabase unavailable."
        };
    }


    if (!file) {

        return {
            success: false,
            message: "No file selected."
        };
    }


    if (
        ![
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ].includes(file.type)
    ) {

        return {
            success: false,
            message: "Please choose a JPG, PNG, WEBP or GIF image."
        };
    }


    const maxSize =
        5 * 1024 * 1024;


    if (file.size > maxSize) {

        return {
            success: false,
            message: "Image must be smaller than 5 MB."
        };
    }


    try {

        const timestamp =
            Date.now();

        const extension =
            file.name.split(".").pop();


        const filePath =
            `post_images/${groupId}/${timestamp}.${extension}`;


        const {
            error: uploadError
        } =
            await groupsSupabase.storage
                .from("group-posts")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            true,

                        contentType:
                            file.type
                    }
                );


        if (uploadError) {

            console.error(
                "❌ Post image upload error:",
                uploadError
            );

            return {
                success: false,
                message: uploadError.message
            };
        }


        const {
            data: publicUrlData
        } =
            groupsSupabase.storage
                .from("group-posts")
                .getPublicUrl(
                    filePath
                );


        const publicUrl =
            publicUrlData?.publicUrl ||
            null;


        if (!publicUrl) {

            return {
                success: false,
                message: "Could not generate public URL."
            };
        }


        console.log(
            "✅ Post image uploaded:",
            publicUrl
        );


        return {
            success: true,
            url: publicUrl
        };


    } catch (error) {

        console.error(
            "❌ Unexpected upload error:",
            error
        );

        return {
            success: false,
            message: error.message
        };
    }
}


// =========================================================


// RENDER GROUP POSTS
// =========================================================

async function renderGroupPosts(posts, groupId) {

    const container =
        document.getElementById("groupPostsContainer");

    if (!container) {
        console.warn("⚠️ Group posts container not found");
        return;
    }

    if (!posts || posts.length === 0) {

        container.innerHTML = `
            <div
                style="
                    text-align:center;
                    padding:40px;
                    opacity:.7;
                "
            >
                📝 No posts yet. Be the first to post!
            </div>
        `;

        return;
    }

    container.innerHTML = "";

    

       container.innerHTML = "";

posts.forEach(post => {

        const profile = post.profiles || {};

        const username =
            profile?.username || "User";

        const fullName =
            profile?.full_name || "";

        const avatar =
            profile?.avatar_url || "";

        const isAuthor =
            String(post.user_id) ===
            String(currentGroupUser?.id);

        const postElement =
            document.createElement("div");

        postElement.style.cssText = `
            background:#fff;
            border:1px solid #eee;
            border-radius:12px;
            padding:16px;
            margin-bottom:12px;
        `;

        postElement.innerHTML = `

            <!-- AUTHOR -->
            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                    margin-bottom:12px;
                "
            >

                ${
                    avatar
                        ? `
                            <img
                                src="${escapeHTML(avatar)}"
                                alt="${escapeHTML(username)}"
                                style="
                                    width:40px;
                                    height:40px;
                                    border-radius:50%;
                                    object-fit:cover;
                                "
                            >
                          `
                        : `
                            <div
                                style="
                                    width:40px;
                                    height:40px;
                                    border-radius:50%;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    background:#eee;
                                    font-size:20px;
                                "
                            >
                                👤
                            </div>
                          `
                }

                <div style="flex:1;">

                    <div style="font-weight:700;">
                        ${escapeHTML(username)}
                    </div>

                    ${
                        fullName
                            ? `
                                <div
                                    style="
                                        font-size:13px;
                                        opacity:.65;
                                    "
                                >
                                    ${escapeHTML(fullName)}
                                </div>
                              `
                            : ""
                    }

                </div>

                ${
                    isAuthor
                        ? `
                            <button
                                type="button"
                                class="delete-group-post-button"
                                style="
                                    border:none;
                                    background:none;
                                    color:#b42318;
                                    cursor:pointer;
                                    font-size:18px;
                                "
                            >
                                🗑️
                            </button>
                          `
                        : ""
                }

            </div>


            <!-- CONTENT -->
            <div
                style="
                    margin-bottom:12px;
                    white-space:pre-wrap;
                    word-wrap:break-word;
                "
            >
                ${escapeHTML(post.content || "")}
            </div>


            <!-- IMAGE -->
            ${
                post.image_url
                    ? `
                        <img
                            src="${escapeHTML(post.image_url)}"
                            alt="Post image"
                            style="
                                width:100%;
                                max-width:100%;
                                border-radius:8px;
                                margin-bottom:10px;
                                max-height:400px;
                                object-fit:cover;
                            "
                        >
                      `
                    : ""
            }


            <!-- DATE -->
            <div
                style="
                    font-size:12px;
                    opacity:.5;
                    margin-bottom:12px;
                "
            >
                ${new Date(post.created_at).toLocaleString()}
            </div>


            <!-- ACTIONS -->
            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:8px;
                    border-top:1px solid #eee;
                    padding-top:10px;
                "
            >

                <button
                    type="button"
                    class="group-like-button"
                    style="
                        border:none;
                        background:#f5f5f5;
                        border-radius:8px;
                        padding:8px 12px;
                        cursor:pointer;
                    "
                              >
                    ❤️ Like
                    <span class="group-like-count">${post.likeCount || 0}</span>
                </button>

                <button
                    type="button"
                    class="group-comment-button"
                    style="
                        border:none;
                        background:#f5f5f5;
                        border-radius:8px;
                        padding:8px 12px;
                        cursor:pointer;
                    "
                >
                    💬 Comment
                </button>


                <button
                    type="button"
                    class="group-share-button"
                    style="
                        border:none;
                        background:#f5f5f5;
                        border-radius:8px;
                        padding:8px 12px;
                        cursor:pointer;
                    "
                >
                    ↗️ Share
                </button>

            </div>


            <!-- COMMENTS AREA -->
            <div
                class="group-comments-area"
                style="
                    display:none;
                    margin-top:12px;
                    border-top:1px solid #eee;
                    padding-top:12px;
                "
            >
<div
    class="group-comments-list"
    style="margin-bottom:10px;"
>
    ${
        (post.comments || []).length === 0
            ? `
                <div
                    style="
                        font-size:13px;
                        opacity:.6;
                        padding:8px 0;
                    "
                >
                    No comments yet.
                </div>
            `
            : (post.comments || []).map(comment => {

                const commentProfile =
                    comment.profile || {};

                const commentUsername =
                    commentProfile.username || "User";

                const commentFullName =
                    commentProfile.full_name || "";

                const commentAvatar =
                    commentProfile.avatar_url || "";

                const isCommentAuthor =
                    String(comment.user_id) ===
                    String(currentGroupUser?.id);

                return `
                    <div
                        style="
                            display:flex;
                            gap:10px;
                            align-items:flex-start;
                            margin-bottom:12px;
                        "
                    >

                        ${
                            commentAvatar
                                ? `
                                    <img
                                        src="${escapeHTML(commentAvatar)}"
                                        alt="${escapeHTML(commentUsername)}"
                                        style="
                                            width:34px;
                                            height:34px;
                                            border-radius:50%;
                                            object-fit:cover;
                                            flex-shrink:0;
                                        "
                                    >
                                `
                                : `
                                    <div
                                        style="
                                            width:34px;
                                            height:34px;
                                            border-radius:50%;
                                            background:#eee;
                                            display:flex;
                                            align-items:center;
                                            justify-content:center;
                                            font-size:17px;
                                            flex-shrink:0;
                                        "
                                    >
                                        👤
                                    </div>
                                `
                        }

                        <div
                            style="
                                flex:1;
                                background:#f5f5f5;
                                border-radius:10px;
                                padding:8px 10px;
                            "
                        >

                            <div
                                style="
                                    font-weight:700;
                                    font-size:13px;
                                "
                            >
                                ${escapeHTML(commentUsername)}
                            </div>

                            ${
                                commentFullName
                                    ? `
                                        <div
                                            style="
                                                font-size:11px;
                                                opacity:.6;
                                            "
                                        >
                                            ${escapeHTML(commentFullName)}
                                        </div>
                                    `
                                    : ""
                            }

                            <div
                                style="
                                    margin-top:5px;
                                    font-size:14px;
                                    white-space:pre-wrap;
                                    word-break:break-word;
                                "
                            >
                                ${escapeHTML(comment.content || "")}
                            </div>

                            <div
                                style="
                                    margin-top:5px;
                                    font-size:10px;
                                    opacity:.5;
                                "
                            >
                                ${new Date(comment.created_at).toLocaleString()}
                            </div>

                            ${
                                isCommentAuthor
                                    ? `
                                        <button
                                            type="button"
                                            class="delete-group-comment-button"
                                            data-comment-id="${escapeHTML(comment.id)}"
                                            style="
                                                border:none;
                                                background:none;
                                                color:#b42318;
                                                cursor:pointer;
                                                font-size:12px;
                                                padding:2px 0;
                                            "
                                        >
                                            🗑️ Delete
                                        </button>
                                    `
                                    : ""
                            }

                        </div>

                    </div>
                `;
            }).join("")
    }
</div>


                <div
                    style="
                        display:flex;
                        gap:8px;
                    "
                >

                    <input
                        type="text"
                        class="group-comment-input"
                        placeholder="Write a comment..."
                        maxlength="2000"
                        style="
                            flex:1;
                            border:1px solid #ddd;
                            border-radius:8px;
                            padding:9px 12px;
                            box-sizing:border-box;
                        "
                    >


                    <button
                        type="button"
                        class="group-send-comment-button"
                        style="
                            border:none;
                            background:#111;
                            color:#fff;
                            border-radius:8px;
                            padding:9px 14px;
                            cursor:pointer;
                        "
                    >
                        Send
                    </button>

                </div>

            </div>

        `;


        // =====================================================
        // DELETE POST
        // =====================================================

        const deleteButton =
            postElement.querySelector(
                ".delete-group-post-button"
            );

        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                () => {

                    deleteGroupPost(
                        post.id,
                        groupId,
                        deleteButton
                    );

                }
            );
        }


        // =====================================================
        // LIKE
        // =====================================================

        const likeButton =
            postElement.querySelector(
                ".group-like-button"
            );

        if (likeButton) {

            likeButton.addEventListener(
                "click",
                async () => {

                    likeButton.disabled = true;

                    await likeGroupPost(
                        post.id,
                        groupId
                    );

                    likeButton.disabled = false;

                }
            );
        }


        // =====================================================
        // COMMENT
        // =====================================================

        const commentButton =
            postElement.querySelector(
                ".group-comment-button"
            );

        const commentsArea =
            postElement.querySelector(
                ".group-comments-area"
            );

        if (commentButton && commentsArea) {

            commentButton.addEventListener(
                "click",
                () => {

                    if (
                        commentsArea.style.display ===
                        "none"
                    ) {

                        commentsArea.style.display =
                            "block";

                    } else {

                        commentsArea.style.display =
                            "none";
                    }

                }
            );
        }

        // =====================================================
// DELETE COMMENT
// =====================================================

const deleteCommentButtons =
    postElement.querySelectorAll(
        ".delete-group-comment-button"
    );

deleteCommentButtons.forEach(
    deleteButton => {

        deleteButton.addEventListener(
            "click",
            async () => {

                const commentId =
                    deleteButton.dataset.commentId;

                if (!commentId) {

                    console.error(
                        "❌ Comment ID not found"
                    );

                    return;
                }

                deleteButton.disabled = true;

                try {

                   await deleteComment(
    commentId,
    post.id,
    groupId
);
                } catch (error) {

                    console.error(
                        "❌ Delete comment error:",
                        error
                    );

                    deleteButton.disabled = false;

                }

            }
        );

    }
);

        // =====================================================
        // SEND COMMENT
        // =====================================================

        const commentInput =
            postElement.querySelector(
                ".group-comment-input"
            );

        const sendCommentButton =
            postElement.querySelector(
                ".group-send-comment-button"
            );

        if (
            commentInput &&
            sendCommentButton
        ) {

            const sendComment = async () => {

                const content =
                    commentInput.value.trim();

                if (!content) {

                    alert(
                        "Please write a comment."
                    );

                    return;
                }

                sendCommentButton.disabled =
                    true;

                const result =
                    await addCommentToPost(
                        post.id,
                        content,
                        groupId
                    );

                sendCommentButton.disabled =
                    false;

                if (result?.success) {

                    commentInput.value = "";

                }

            };


            sendCommentButton.addEventListener(
                "click",
                sendComment
            );


            commentInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" &&
                        !event.shiftKey
                    ) {

                        event.preventDefault();

                        sendComment();

                    }

                }
            );

        }


        // =====================================================
        // SHARE
        // =====================================================

        const shareButton =
            postElement.querySelector(
                ".group-share-button"
            );

        if (shareButton) {

            shareButton.addEventListener(
                "click",
                async () => {

                    const shareText =
                        post.content || "";

                    try {

                        if (
                            navigator.clipboard
                        ) {

                            await navigator.clipboard.writeText(
                                shareText
                            );

                            alert(
                                "✅ Post text copied!"
                            );

                        } else {

                            alert(
                                "↗️ Share feature will be connected next."
                            );

                        }

                    } catch (error) {

                        console.error(
                            "❌ Share error:",
                            error
                        );

                        alert(
                            "↗️ Share feature will be connected next."
                        );

                    }

                }
            );
        }


        // =====================================================
        // ADD POST TO PAGE
        // =====================================================

        container.appendChild(
            postElement
        );

    });
}

// =========================================================
// OPEN GROUP PAGE WITH POSTS - REPLACES the old one
// =========================================================

async function openGroupPage(
    group
) {

    console.log(
        "📝 Opening group page:",
        group
    );


    // =====================================================
    // CREATE OR SHOW GROUP PAGE
    // =====================================================

    let groupPageModal =
        document.getElementById(
            "groupPageModal"
        );


    if (!groupPageModal) {

        groupPageModal =
            document.createElement(
                "div"
            );

        groupPageModal.id =
            "groupPageModal";

        groupPageModal.className =
            "group-modal";

        groupPageModal.hidden =
            true;

        groupPageModal.innerHTML = `

            <div
                class="group-modal-overlay"
                id="groupPageModalOverlay"
            ></div>

            <div
                class="group-modal-content"
                style="
                    max-width:700px;
                    width:94%;
                    max-height:90vh;
                    overflow-y:auto;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:15px;
                        margin-bottom:20px;
                    "
                >

                    <h2
                        id="groupPageTitle"
                        style="
                            margin:0;
                        "
                    >
                        📝 Group Posts
                    </h2>

                    <button
                        type="button"
                        id="closeGroupPageModal"
                        style="
                            border:none;
                            background:none;
                            font-size:24px;
                            cursor:pointer;
                        "
                    >
                        ×
                    </button>

                </div>


                <!-- CREATE POST FORM -->
                <div
                    style="
                        background:#f9f9f9;
                        border-radius:12px;
                        padding:16px;
                        margin-bottom:20px;
                    "
                >

                    <textarea
                        id="groupPostContentInput"
                        placeholder="Write something in ${escapeHTML(group.name)}..."
                        style="
                            width:100%;
                            padding:12px;
                            border:1px solid #ddd;
                            border-radius:10px;
                            font-size:15px;
                            min-height:80px;
                            resize:vertical;
                            box-sizing:border-box;
                            font-family:inherit;
                        "
                    ></textarea>


                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:12px;
                            margin-top:12px;
                            flex-wrap:wrap;
                        "
                    >

                        <input
                            type="file"
                            id="groupPostImageInput"
                            accept="image/*"
                            style="
                                display:none;
                            "
                        >

                        <button
                            type="button"
                            id="groupPostImageButton"
                            style="
                                border:1px solid #ddd;
                                background:#fff;
                                border-radius:8px;
                                padding:9px 14px;
                                cursor:pointer;
                            "
                        >
                            📷 Add Image
                        </button>


                        <div
                            id="groupPostImagePreview"
                            style="
                                display:none;
                                position:relative;
                            "
                        >

                            <img
                                id="groupPostImagePreviewImg"
                                style="
                                    max-height:60px;
                                    border-radius:6px;
                                "
                            >

                            <button
                                type="button"
                                id="groupPostImageRemove"
                                style="
                                    position:absolute;
                                    top:-8px;
                                    right:-8px;
                                    border:none;
                                    background:#b42318;
                                    color:#fff;
                                    border-radius:50%;
                                    width:22px;
                                    height:22px;
                                    cursor:pointer;
                                    font-size:14px;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                "
                            >
                                ×
                            </button>

                        </div>


                        <button
                            type="button"
                            id="submitGroupPostButton"
                            style="
                                border:none;
                                background:#111;
                                color:#fff;
                                border-radius:8px;
                                padding:9px 18px;
                                cursor:pointer;
                                font-weight:600;
                                margin-left:auto;
                            "
                        >
                            📤 Post
                        </button>

                    </div>

                </div>


                <!-- POSTS LIST -->
                <div
                    id="groupPostsContainer"
                    style="
                        display:flex;
                        flex-direction:column;
                        gap:12px;
                    "
                >
                    <div
                        style="
                            text-align:center;
                            padding:40px;
                            opacity:.7;
                        "
                    >
                        ⏳ Loading posts...
                    </div>
                </div>

            </div>
        `;


        document.body.appendChild(
            groupPageModal
        );


        // =====================================================
        // CLOSE MODAL
        // =====================================================

        document
            .getElementById(
                "closeGroupPageModal"
            )
            ?.addEventListener(
                "click",
                () => {

                    closeGroupPageModal();

                }
            );


        document
            .getElementById(
                "groupPageModalOverlay"
            )
            ?.addEventListener(
                "click",
                () => {

                    closeGroupPageModal();

                }
            );


        // =====================================================
        // IMAGE UPLOAD BUTTON
        // =====================================================

        document
            .getElementById(
                "groupPostImageButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    document
                        .getElementById(
                            "groupPostImageInput"
                        )
                        ?.click();

                }
            );


        // =====================================================
        // IMAGE PREVIEW
        // =====================================================

        document
            .getElementById(
                "groupPostImageInput"
            )
            ?.addEventListener(
                "change",
                function () {

                    const file =
                        this.files &&
                        this.files[0];


                    if (!file) {

                        return;
                    }


                    const preview =
                        document.getElementById(
                            "groupPostImagePreview"
                        );

                    const img =
                        document.getElementById(
                            "groupPostImagePreviewImg"
                        );


                    if (preview && img) {

                        const reader =
                            new FileReader();


                        reader.onload =
                            function (e) {

                                img.src =
                                    e.target.result;

                                preview.style.display =
                                    "block";

                            };


                        reader.readAsDataURL(
                            file
                        );

                    }

                }
            );


        // =====================================================
        // REMOVE IMAGE
        // =====================================================

        document
            .getElementById(
                "groupPostImageRemove"
            )
            ?.addEventListener(
                "click",
                () => {

                    const preview =
                        document.getElementById(
                            "groupPostImagePreview"
                        );

                    const input =
                        document.getElementById(
                            "groupPostImageInput"
                        );


                    if (preview) {

                        preview.style.display =
                            "none";

                    }


                    if (input) {

                        input.value =
                            "";

                    }

                }
            );


        // =====================================================
        // SUBMIT POST
        // =====================================================

        document
            .getElementById(
                "submitGroupPostButton"
            )
            ?.addEventListener(
                "click",
                async () => {

                    const contentInput =
                        document.getElementById(
                            "groupPostContentInput"
                        );

                    const imageInput =
                        document.getElementById(
                            "groupPostImageInput"
                        );


                    const content =
                        contentInput?.value ||
                        "";


                    const imageFile =
                        imageInput?.files &&
                        imageInput.files[0];


                    if (!content.trim()) {

                        alert(
                            "Please write something."
                        );

                        return;
                    }


                    const button =
                        document.getElementById(
                            "submitGroupPostButton"
                        );


                    if (button) {

                        button.disabled =
                            true;

                        button.textContent =
                            "Posting...";
                    }


                    const result =
                        await createGroupPost(
                            group.id,
                            content,
                            imageFile
                        );


                    if (result.success) {

                        if (contentInput) {

                            contentInput.value =
                                "";

                        }


                        if (imageInput) {

                            imageInput.value =
                                "";

                        }


                        const preview =
                            document.getElementById(
                                "groupPostImagePreview"
                            );


                        if (preview) {

                            preview.style.display =
                                "none";

                        }

                    }


                    if (button) {

                        button.disabled =
                            false;

                        button.textContent =
                            "📤 Post";
                    }

                }
            );

    }


    // =====================================================
    // OPEN MODAL
    // =====================================================

    const title =
        document.getElementById(
            "groupPageTitle"
        );


    if (title) {

        title.textContent =
            `📝 ${escapeHTML(group.name)}`;
    }


    groupPageModal.hidden =
        false;

    groupPageModal.classList.add(
        "active"
    );

    groupPageModal.style.display =
        "flex";

    document.body.style.overflow =
        "hidden";


    // =====================================================
    // LOAD POSTS
    // =====================================================

    await loadGroupPosts(
        group.id
    );
}


// =========================================================
// CLOSE GROUP PAGE MODAL
// =========================================================

function closeGroupPageModal() {

    const modal =
        document.getElementById(
            "groupPageModal"
        );


    if (!modal) {
        return;
    }


    modal.hidden =
        true;

    modal.classList.remove(
        "active"
    );

    modal.style.display =
        "";

    document.body.style.overflow =
        "";
}


// =========================================================
// MAKE POST FUNCTIONS GLOBAL
// =========================================================

window.openGroupPage =
    openGroupPage;

window.closeGroupPageModal =
    closeGroupPageModal;

window.createGroupPost =
    createGroupPost;

window.loadGroupPosts =
    loadGroupPosts;

window.deleteGroupPost =
    deleteGroupPost;
    // =========================================================
// INITIALIZATION
// =========================================================

async function initializeGroups() {

    console.log(
        "🚀 Initializing Groups..."
    );


    if (!groupsSupabase) {

        console.error(
            "❌ Groups Supabase unavailable"
        );

        return;
    }


    ensureGroupPeopleModals();


    currentGroupUser =
        await getCurrentGroupUser();


    if (!currentGroupUser) {

        console.warn(
            "⚠️ No authenticated user"
        );

    }


    await loadGroups();


    console.log(
        "✅ GROUPS SYSTEM READY"
    );
}


// =========================================================
// START GROUPS
// =========================================================


initializeGroups();

// =========================================================
// LIKE GROUP POST
// =========================================================

async function likeGroupPost(
    postId,
    groupId
) {

    console.log(
        "❤️ Liking post:",
        postId
    );


    if (!groupsSupabase) {

        alert(
            "Supabase connection is unavailable."
        );

        return {
            success: false,
            message: "Supabase unavailable."
        };
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return {
            success: false,
            message: "You must be logged in."
        };
    }


    try {

        // =====================================================
        // CHECK IF ALREADY LIKED
        // =====================================================

        const {
            data: existingLike,
            error: checkError
        } =
            await groupsSupabase
                .from("group_post_likes")
                .select(
                    "post_id, user_id"
                )
                .eq(
                    "post_id",
                    postId
                )
                .eq(
                    "user_id",
                    currentGroupUser.id
                )
                .maybeSingle();


        if (checkError && checkError.code !== "PGRST116") {

            console.error(
                "❌ Check like error:",
                checkError
            );

            return {
                success: false,
                message: checkError.message
            };
        }


        let action = "liked";


        if (existingLike) {

            // =====================================================
            // UNLIKE
            // =====================================================

            const {
                error: deleteError
            } =
                await groupsSupabase
                    .from("group_post_likes")
                    .delete()
                    .eq(
                        "post_id",
                        postId
                    )
                    .eq(
                        "user_id",
                        currentGroupUser.id
                    );


            if (deleteError) {

                console.error(
                    "❌ Unlike error:",
                    deleteError
                );

                return {
                    success: false,
                    message: deleteError.message
                };
            }

            action = "unliked";

        } else {

            // =====================================================
            // LIKE
            // =====================================================

            const {
                error: insertError
            } =
                await groupsSupabase
                    .from("group_post_likes")
                    .insert({

                        post_id:
                            postId,

                        user_id:
                            currentGroupUser.id

                    });


            if (insertError) {

                console.error(
                    "❌ Like error:",
                    insertError
                );

                alert(
                    "Could not like post: " +
                    insertError.message
                );

                return {
                    success: false,
                    message: insertError.message
                };
            }

        }


        console.log(
            `✅ Post ${action}:`,
            postId
        );


        // =====================================================
        // REFRESH POSTS
        // =====================================================

        await loadGroupPosts(
            groupId
        );


        return {
            success: true,
            action: action,
            message: `Post ${action} successfully!`
        };


    } catch (error) {

        console.error(
            "❌ Unexpected like error:",
            error
        );

        alert(
            "Could not like post: " +
            error.message
        );

        return {
            success: false,
            message: error.message
        };
    }
}
// =========================================================
// ADD COMMENT TO POST
// =========================================================

async function addCommentToPost(
    postId,
    content,
    groupId
) {

    console.log(
        "💬 Adding comment:",
        {
            postId,
            groupId
        }
    );


    if (!groupsSupabase) {

        alert(
            "Supabase connection is unavailable."
        );

        return {
            success: false,
            message: "Supabase unavailable."
        };
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return {
            success: false,
            message: "You must be logged in."
        };
    }


    if (!content || content.trim().length === 0) {

        alert(
            "Please write a comment."
        );

        return {
            success: false,
            message: "Comment cannot be empty."
        };
    }


    if (content.trim().length > 2000) {

        alert(
            "Comment is too long (max 2000 characters)."
        );

        return {
            success: false,
            message: "Comment too long."
        };
    }


    try {

        // =====================================================
        // ADD COMMENT
        // =====================================================

      
              const {
    data: newComment,
    error: commentError
} =
    await groupsSupabase
        .from("group_post_comments")
        .insert({

            post_id:
                postId,

            user_id:
                currentGroupUser.id,

            content:
                content.trim()

        });


        if (commentError) {

            console.error(
                "❌ Add comment error:",
                commentError
            );

            alert(
                "Could not add comment: " +
                commentError.message
            );

            return {
                success: false,
                message: commentError.message
            };
        }


        console.log(
            "✅ Comment added:",
            newComment
        );


        // =====================================================
        // REFRESH POSTS
        // =====================================================

        await loadGroupPosts(
            groupId
        );


        return {
            success: true,
            data: newComment,
            message: "Comment added successfully!"
        };


    } catch (error) {

        console.error(
            "❌ Unexpected comment error:",
            error
        );

        alert(
            "Could not add comment: " +
            error.message
        );

        return {
            success: false,
            message: error.message
        };
    }
}


// =========================================================
// =========================================================
// 🆕 LIKES & COMMENTS FUNCTIONS
// =========================================================
// =========================================================


// =========================================================
// LIKE GROUP POST
// =========================================================

async function likeGroupPost(
    postId,
    groupId
) {

    console.log(
        "❤️ Liking post:",
        postId
    );


    if (!groupsSupabase) {

        alert(
            "Supabase connection is unavailable."
        );

        return {
            success: false,
            message: "Supabase unavailable."
        };
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return {
            success: false,
            message: "You must be logged in."
        };
    }


    try {

        // =====================================================
        // CHECK IF ALREADY LIKED
        // =====================================================

        const {
            data: existingLike,
            error: checkError
        } =
            await groupsSupabase
                .from("group_post_likes")
                .select(
                    "post_id, user_id"
                )
                .eq(
                    "post_id",
                    postId
                )
                .eq(
                    "user_id",
                    currentGroupUser.id
                )
                .maybeSingle();


        if (checkError && checkError.code !== "PGRST116") {

            console.error(
                "❌ Check like error:",
                checkError
            );

            return {
                success: false,
                message: checkError.message
            };
        }


        let action = "liked";


        if (existingLike) {

            // =====================================================
            // UNLIKE
            // =====================================================

            const {
                error: deleteError
            } =
                await groupsSupabase
                    .from("group_post_likes")
                    .delete()
                    .eq(
                        "post_id",
                        postId
                    )
                    .eq(
                        "user_id",
                        currentGroupUser.id
                    );


            if (deleteError) {

                console.error(
                    "❌ Unlike error:",
                    deleteError
                );

                return {
                    success: false,
                    message: deleteError.message
                };
            }

            action = "unliked";

        } else {

            // =====================================================
            // LIKE
            // =====================================================

            const {
                error: insertError
            } =
                await groupsSupabase
                    .from("group_post_likes")
                    .insert({

                        post_id:
                            postId,

                        user_id:
                            currentGroupUser.id

                    });


            if (insertError) {

                console.error(
                    "❌ Like error:",
                    insertError
                );

                alert(
                    "Could not like post: " +
                    insertError.message
                );

                return {
                    success: false,
                    message: insertError.message
                };
            }

        }


        console.log(
            `✅ Post ${action}:`,
            postId
        );


        // =====================================================
        // REFRESH POSTS
        // =====================================================

        await loadGroupPosts(
            groupId
        );


        return {
            success: true,
            action: action,
            message: `Post ${action} successfully!`
        };


    } catch (error) {

        console.error(
            "❌ Unexpected like error:",
            error
        );

        alert(
            "Could not like post: " +
            error.message
        );

        return {
            success: false,
            message: error.message
        };
    }
}


// =========================================================
// ADD COMMENT TO POST
// =========================================================

async function addCommentToPost(
    postId,
    content,
    groupId
) {

    console.log(
        "💬 Adding comment:",
        {
            postId,
            groupId
        }
    );


    if (!groupsSupabase) {

        alert(
            "Supabase connection is unavailable."
        );

        return {
            success: false,
            message: "Supabase unavailable."
        };
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return {
            success: false,
            message: "You must be logged in."
        };
    }


    if (!content || content.trim().length === 0) {

        alert(
            "Please write a comment."
        );

        return {
            success: false,
            message: "Comment cannot be empty."
        };
    }


    if (content.trim().length > 2000) {

        alert(
            "Comment is too long (max 2000 characters)."
        );

        return {
            success: false,
            message: "Comment too long."
        };
    }


    try {

        // =====================================================
        // ADD COMMENT
        // =====================================================

        const {
            data: newComment,
            error: commentError
        } =
            await groupsSupabase
                .from("group_post_comments")
                .insert({

                    post_id:
                        postId,

                    user_id:
                        currentGroupUser.id,

                    content:
                        content.trim()

                })
              

        if (commentError) {

            console.error(
                "❌ Add comment error:",
                commentError
            );

            alert(
                "Could not add comment: " +
                commentError.message
            );

            return {
                success: false,
                message: commentError.message
            };
        }


        console.log(
            "✅ Comment added:",
            newComment
        );


        // =====================================================
        // REFRESH POSTS
        // =====================================================

        await loadGroupPosts(
            groupId
        );


        return {
            success: true,
            data: newComment,
            message: "Comment added successfully!"
        };


    } catch (error) {

        console.error(
            "❌ Unexpected comment error:",
            error
        );

        alert(
            "Could not add comment: " +
            error.message
        );

        return {
            success: false,
            message: error.message
        };
    }
}


// =========================================================
// DELETE COMMENT
// =========================================================

async function deleteComment(
    commentId,
    postId,
    groupId
) {

    console.log(
        "🗑️ Deleting comment:",
        commentId
    );


    if (!groupsSupabase) {

        alert(
            "Supabase connection is unavailable."
        );

        return {
            success: false,
            message: "Supabase unavailable."
        };
    }


    if (!currentGroupUser) {

        currentGroupUser =
            await getCurrentGroupUser();
    }


    if (!currentGroupUser) {

        alert(
            "Please log in first."
        );

        return {
            success: false,
            message: "You must be logged in."
        };
    }


    try {

        // =====================================================
        // VERIFY OWNERSHIP
        // =====================================================

        const {
            data: comment,
            error: commentError
        } =
            await groupsSupabase
                .from("group_post_comments")
                .select(
                    "id, user_id"
                )
                .eq(
                    "id",
                    commentId
                )
                .single();


        if (commentError) {

            console.error(
                "❌ Load comment error:",
                commentError
            );

            alert(
                "Could not find this comment."
            );

            return {
                success: false,
                message: commentError.message
            };
        }


        if (
            String(comment.user_id) !==
            String(currentGroupUser.id)
        ) {

            alert(
                "You can only delete your own comments."
            );

            return {
                success: false,
                message: "Not authorized."
            };
        }


        // =====================================================
        // DELETE COMMENT
        // =====================================================

        const {
            error: deleteError
        } =
            await groupsSupabase
                .from("group_post_comments")
                .delete()
                .eq(
                    "id",
                    commentId
                );


        if (deleteError) {

            console.error(
                "❌ Delete comment error:",
                deleteError
            );

            alert(
                "Could not delete comment: " +
                deleteError.message
            );

            return {
                success: false,
                message: deleteError.message
            };
        }


        console.log(
            "✅ Comment deleted:",
            commentId
        );


        // =====================================================
        // REFRESH POSTS
        // =====================================================

        await loadGroupPosts(
            groupId
        );


        return {
            success: true,
            message: "Comment deleted successfully!"
        };


    } catch (error) {

        console.error(
            "❌ Unexpected delete comment error:",
            error
        );

        alert(
            "Could not delete comment: " +
            error.message
        );

        return {
            success: false,
            message: error.message
        };
    }
}


// =========================================================
// MAKE FUNCTIONS GLOBAL
// =========================================================

window.likeGroupPost = likeGroupPost;
window.addCommentToPost = addCommentToPost;
window.deleteComment = deleteComment;