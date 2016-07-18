<?php

namespace Intern\Email;

class InternshipCancelNotice extends Email{

  /**
   * Notifies of internship cancelation.
   *
   * @param Internship $i
   */
  public static function sendEmail(Internship $i)
  {
      $settings = InternSettings::getInstance();

      $tpl = array();


      $tpl['NAME'] = $i->getFullName();
      $tpl['BANNER'] = $i->banner;

      $tpl['TERM'] = Term::rawToRead($i->term);

      $dept = new Department($i->department_id);
      $tpl['DEPARTMENT'] = $dept->getName();

      $to = $i->email . '@appstate.edu';

      $faculty = $i->getFaculty();
      if ($faculty instanceof Faculty) {
          $cc = array($faculty->getUsername() . '@' . $settings->getEmailDomain(), $settings->getRegistrarEmail());
      } else {
          $cc = array();
      }

      $subject = 'Internship Cancelled ' . Term::rawToRead($i->getTerm()) . '[' . $i->getBannerId() . '] ' . $i->getFullName();

      Email::sendTemplateMessage($to, $subject, 'email/StudentCancellationNotice.tpl', $tpl, $cc);
  }
}
