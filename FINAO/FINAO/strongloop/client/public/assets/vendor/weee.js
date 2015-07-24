/**
2   * Magento
3   *
4   * NOTICE OF LICENSE
5   *
6   * This source file is subject to the Academic Free License (AFL 3.0)
7   * that is bundled with this package in the file LICENSE_AFL.txt.
8   * It is also available through the world-wide-web at this URL:
    9   * http://opensource.org/licenses/afl-3.0.php
10   * If you did not receive a copy of the license and are unable to
11   * obtain it through the world-wide-web, please send an email
12   * to license@magentocommerce.com so we can send you a copy immediately.
13   *
14   * DISCLAIMER
15   *
16   * Do not edit or add to this file if you wish to upgrade Magento to newer
17   * versions in the future. If you wish to customize Magento for your
    18   * needs please refer to http://www.magentocommerce.com for more information.
    19   *
    20   * @category    Varien
21   * @package     js
22   * @copyright   Copyright (c) 2014 Magento Inc. (http://www.magentocommerce.com)
23   * @license     http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
    24   */

  /**************************** WEEE STUFF ********************************/
  function taxToggle(details, switcher, expandedClassName)
  {
          if ($(details).style.display == 'none') {
                  $(details).show();
                  $(switcher).addClassName(expandedClassName);
              } else {
                  $(details).hide();
                  $(switcher).removeClassName(expandedClassName);
              }
      }
