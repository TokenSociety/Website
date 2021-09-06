<div class="TokenSociety_temporary_dashboard">
	
	<?= Q_Html::img('img/tokensociety.jpg', ['class' => 'TokenSociety_logo']) ?>
	
</div>
<div id='dashboard'>
	<?= Q_Html::img('img/icon/310.png', ['class' => 'TokenSociety_logo']) ?>

	<?php if (!empty($_COOKIE['demo'])): ?>
	<div id="dashboard_user_contextual">
		<ul class="Q_listing">
			<li data-action="setIdentifier"><?= $dashboard['SetEmailAddress'] ?></li>
			<li data-action="logout"><?= $dashboard['LogOut'] ?></li>
		</ul>
	</div>
	
	<?= Q::tool('TokenSociety/search', []) ?>
	
	<?php if ($isMobile): ?>
		<button class="TokenSociety_user" id="TokenSociety_connect"><?= $dashboard['Connect'] ?></button>
	<?php endif; ?>
	
	<?php echo Q::tool('Q/tabs', array(
		'vertical' => !$isMobile and Q_Config::get('Q', 'response', 'layout', 'sidebar', false),
		'overflow' => array(
			'content' => '{{text}}',
			'defaultHtml' => $dashboard['Menu']
		),
		'compact' => false,
		'tabs' => $tabs,
		'urls' => $urls
	))?>
		
	<?php if (!$isMobile): ?>
		<button class="TokenSociety_user" id="TokenSociety_connect"><?= $dashboard['Connect'] ?></button>
	<?php endif; ?>
	
	<?php endif; ?>
</div>
