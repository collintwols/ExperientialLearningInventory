<?php

  /**
   * Admin
   *
   * Encapsulates the manaing of granular access by department.
   *
   * @author Robert Bost <bostrt at tux dot appstate dot edu>
   */
PHPWS_Core::initModClass('intern', 'Model.php');

class Admin extends Model
{
    public $username;
    public $department_id;

    /**
     * @Override Model::getDb
     */
    public function getDb()
    {
        return new PHPWS_DB('intern_admin');
    }

    /**
     * @Override Model::getCSV
     */
    public function getCSV(){}

    public static function allowed($username, $dept)
    {
        if($dept instanceof Department){
            // User passed Department Obj.
            $dept = $dept->id;
        }

        $db = self::getDb();
        $db->addWhere('username', $username);
        $db->addWhere('department_id', $dept);
        $db->addColumn('id', $count=true);
        $count = $db->select();
        // If 1+ row exists in table then they're allowed.
        if(sizeof($count) >= 1){
            return true;
        }else{
            return false;
        }
    }

    /**
     * Row tags for DBPager.
     */
    public function rowTags()
    {
        PHPWS_Core::initModClass('intern', 'Department.php');
        $d = new Department($this->department_id);
        $link = PHPWS_Text::secureLink('Delete', 'intern', array('action' => 'edit_admins',
                                                                 'del' => true,
                                                                 'username' => $this->username,
                                                                 'department_id' => $this->department_id));
        return array('USERNAME' => $this->username,
                     'DEPARTMENT' => $d->name,
                     'DELETE' => $link);
    }

    /**
     * Grant user access to search and manage Department.
     */
    public static function add($username, $departmentId)
    {
        // First check that the username passed in is a registered user.
        $db = new PHPWS_DB('users');
        $db->addWhere('username', $username);
        $db->addColumn('id', $count=true);
        if(sizeof($db->select()) == 0){
            // No user exists with that name.
            return NQ::simple('intern', INTERN_ERROR, "No user exists with the name <i>$username</i>. Please choose a valid username.");
        }

        PHPWS_Core::initModClass('intern', 'Department.php');
        $d = new Department($departmentId);

        // Check if user already has permission.
        if(self::allowed($username, $departmentId)){
            // User permission has already been added.
            return NQ::simple('intern', INTERN_WARNING, "<i>$username</i> can already view internships in <i>$d->name</i>.");
        }

        $ia = new Admin();
        $ia->username = $username;
        $ia->department_id = $departmentId;
        $ia->save();
        NQ::simple('intern', INTERN_SUCCESS, "<i>$username</i> can now view internships for <i>$d->name</i>.");
    }

    /**
     * Remove user's access to Department.
     */
    public static function del($username, $departmentId)
    {
        PHPWS_Core::initModClass('intern', 'Department.php');
        $d = new Department($departmentId);

        $db = self::getDb();
        $db->addWhere('username', $username);
        $db->addWhere('department_id', $departmentId);
        $db->delete();
        NQ::simple('intern', INTERN_SUCCESS, "<i>$username</i> no longer view internships for <i>$d->name</i>.");
    }

    public static function getAdminPager()
    {
        PHPWS_Core::initCoreClass('DBPager.php');
        $pager = new DBPager('intern_admin', 'Admin');

        $pager->setModule('intern');
        $pager->setTemplate('admin_pager.tpl');
        $pager->setEmptyMessage('No admins found.');
        $pager->addRowTags('rowTags');
        
        return $pager->get();
    }
}

?>