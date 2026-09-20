/** Prepared adapter. No external messages are sent by the prototype. Enable only after configuring approved templates and recipient consent. */
export interface NotificationTransport {prepare(to:string,template:string,parameters:string[]):Record<string,unknown>}
export class WhatsAppTemplateAdapter implements NotificationTransport {prepare(to:string,template:string,parameters:string[]){return {messaging_product:'whatsapp',to,type:'template',template:{name:template,language:{code:'en'},components:[{type:'body',parameters:parameters.map(text=>({type:'text',text}))}]}}}}
