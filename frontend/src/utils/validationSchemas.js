import * as Yup from 'yup';

// Before You Begin Page Schema
export const beforeYouBeginSchema = Yup.object().shape({
  reported_officially: Yup.string()
    .required('Please select an option'),
  research_consent: Yup.boolean()
    .optional()
});

// Personal Information Page Schema
export const personalInfoSchema = Yup.object().shape({
  age_group: Yup.string()
    .required('Please select your age group'),
  school_level: Yup.string()
    .required('Please select your school level'),
  school_board: Yup.string()
    .required('Please select your school board'),
  gender_identity: Yup.string()
    .required('Please select your gender identity'),
  sexual_orientation: Yup.string()
    .required('Please select your sexual orientation'),
  cultural_background: Yup.string()
    .optional(),
  contact_permission: Yup.boolean()
    .optional(),
  contact_email: Yup.string()
    .email('Please enter a valid email address')
    .when('contact_permission', {
      is: true,
      then: Yup.string().required('Email is required when permission to contact is given')
    }),
  contact_phone: Yup.string()
    .optional()
    .matches(/^(\+\d{1,3}[- ]?)?\d{10,14}$/, 'Phone number is not valid')
});

// Incident Details Page Schema
export const incidentDetailsSchema = Yup.object().shape({
  incident_date: Yup.date()
    .required('Please provide the date of the incident')
    .max(new Date(), 'Date cannot be in the future'),
  location_type: Yup.string()
    .required('Please select the location type'),
  school_name: Yup.string()
    .required('Please provide the school name'),
  incident_type: Yup.array()
    .min(1, 'Please select at least one incident type')
    .required('Please select the type of incident'),
  other_incident_type: Yup.string()
    .when('incident_type', {
      is: (value) => value && value.includes('Other'),
      then: Yup.string().required('Please specify the incident type')
    }),
  description: Yup.string()
    .required('Please provide a description of the incident')
    .min(20, 'Description should be at least 20 characters'),
  witnesses: Yup.string()
    .optional(),
  reported_incident_date: Yup.date()
    .when('reported_officially', {
      is: 'Yes',
      then: Yup.date()
        .required('Please provide the date you reported the incident')
        .max(new Date(), 'Date cannot be in the future')
    }),
  reported_to: Yup.array()
    .when('reported_officially', {
      is: 'Yes',
      then: Yup.array()
        .min(1, 'Please select at least one option')
        .required('Please select who you reported the incident to')
    })
});

// Reporting Response Page Schema
export const reportingResponseSchema = Yup.object().shape({
  barriers_to_reporting: Yup.array()
    .when('reported_officially', {
      is: (value) => value !== 'Yes',
      then: Yup.array()
        .min(1, 'Please select at least one barrier')
        .required('Please select the barriers to reporting')
    }),
  other_barrier: Yup.string()
    .when('barriers_to_reporting', {
      is: (value) => value && value.includes('Other'),
      then: Yup.string().required('Please specify the barrier')
    }),
  reporting_experience: Yup.string()
    .when('reported_officially', {
      is: 'Yes',
      then: Yup.string().required('Please describe your reporting experience')
    }),
  reporting_timeline: Yup.string()
    .when('reported_officially', {
      is: 'Yes',
      then: Yup.string().required('Please select the response timeline')
    }),
  reporting_followup: Yup.string()
    .when('reported_officially', {
      is: 'Yes',
      then: Yup.string().required('Please describe any follow-up after your report')
    })
});

// School Response Page Schema
export const schoolResponseSchema = Yup.object().shape({
  actions_taken: Yup.array()
    .when('reported_officially', {
      is: 'Yes',
      then: Yup.array()
        .min(1, 'Please select at least one action')
        .required('Please select the actions taken')
    }),
  other_action: Yup.string()
    .when('actions_taken', {
      is: (value) => value && value.includes('Other'),
      then: Yup.string().required('Please specify the action taken')
    }),
  action_effectiveness: Yup.string()
    .when('reported_officially', {
      is: 'Yes',
      then: Yup.string().required('Please describe the effectiveness of the actions')
    }),
  followup_provided: Yup.string()
    .when('reported_officially', {
      is: 'Yes',
      then: Yup.string().required('Please describe any follow-up provided')
    }),
  perpetrator_consequences: Yup.string()
    .when('reported_officially', {
      is: 'Yes',
      then: Yup.string().required('Please describe any consequences for the perpetrator(s)')
    }),
  satisfied_with_response: Yup.string()
    .when('reported_officially', {
      is: 'Yes',
      then: Yup.string().required('Please select whether you were satisfied with the response')
    }),
  satisfaction_rating: Yup.string()
    .when('reported_officially', {
      is: 'Yes',
      then: Yup.string().required('Please rate the school\'s response')
    }),
  improvement_suggestions: Yup.string()
    .required('Please provide suggestions for improvement')
});

// Impact Support Page Schema
export const impactSupportSchema = Yup.object().shape({
  emotional_impact: Yup.array()
    .min(1, 'Please select at least one emotional impact')
    .required('Please select the emotional impact'),
  other_emotional_impact: Yup.string()
    .when('emotional_impact', {
      is: (value) => value && value.includes('Other'),
      then: Yup.string().required('Please specify the emotional impact')
    }),
  academic_impact: Yup.array()
    .min(1, 'Please select at least one academic impact')
    .required('Please select the academic impact'),
  other_academic_impact: Yup.string()
    .when('academic_impact', {
      is: (value) => value && value.includes('Other'),
      then: Yup.string().required('Please specify the academic impact')
    }),
  physical_impact: Yup.string()
    .optional(),
  long_term_impact: Yup.string()
    .optional(),
  support_received: Yup.array()
    .min(1, 'Please select at least one support option')
    .required('Please select the support received'),
  other_support: Yup.string()
    .when('support_received', {
      is: (value) => value && value.includes('Other'),
      then: Yup.string().required('Please specify the support received')
    }),
  additional_support_needed: Yup.string()
    .required('Please describe what additional support would have been helpful')
});

// Additional Info Page Schema
export const additionalInfoSchema = Yup.object().shape({
  systemic_changes: Yup.string()
    .required('Please share your thoughts on systemic changes needed'),
  resources_needed: Yup.string()
    .required('Please share what resources would be helpful'),
  anything_else: Yup.string()
    .optional(),
  report_value: Yup.string()
    .required('Please provide feedback on the value of this reporting platform')
}); 