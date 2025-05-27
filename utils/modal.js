function getModalDefinition(email = '', originalText = '', departmentOptions = []) {
  return {
    type: "modal",
    callback_id: "create_ticket_modal",
    title: {
      type: "plain_text",
      text: "Create Service Request"
    },
    submit: {
      type: "plain_text",
      text: "Send"
    },
    close: {
      type: "plain_text",
      text: "Cancel"
    },
    blocks: [
      {
        type: "input",
        block_id: "emailarea",
        element: {
          type: "plain_text_input",
          action_id: "plain_text_input-action",
          initial_value: email
        },
        label: {
          type: "plain_text",
          text: "Requester Email:"
        }
      },
      {
        type: "input",
        block_id: "grouparea",
        element: {
          type: "static_select",
          placeholder: {
            type: "plain_text",
            text: "Select a department"
          },
          options: departmentOptions,
          action_id: "static_select-action"
        },
        label: {
          type: "plain_text",
          text: "Department"
        }
      },
      {
        type: "input",
        block_id: "descarea",
        element: {
          type: "plain_text_input",
          multiline: true,
          action_id: "plain_text_input-action",
          initial_value: originalText
        },
        label: {
          type: "plain_text",
          text: "Request Description:"
        }
      }
    ]
  };
}

module.exports = { getModalDefinition };
