export class DomainRuleViolation extends Error {}
export class NotRequestOwner extends DomainRuleViolation {}
export class RequestNotEditable extends DomainRuleViolation {}
