-- Keep the first exact cancellation request made during a Stripe trial.
-- The event is operational metadata only and never contains conversation data.
alter table public.product_events
  drop constraint if exists product_events_event_check;

alter table public.product_events
  add constraint product_events_event_check
  check(event in ('registered','checkout_opened','checkout_completed','first_answer','guided_start','paid','canceled','trial_canceled','top_up'));
