<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="calendar-list">
	<ul>
		<xsl:for-each select="./*">
			<xsl:call-template name="sidebar-calendar-entry"/>
		</xsl:for-each>
		<li class="add-calendar" data-click="sidebar-add-calendar">
			<i class="icon-plus"></i>
			<span>Add Calendar</span>
		</li>
	</ul>
</xsl:template>


<xsl:template name="sidebar-calendar-entry">
	<li>
		<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>
		<xsl:attribute name="data-color"><xsl:value-of select="@color"/></xsl:attribute>
		<span>
			<xsl:attribute name="class">form-checkbox_ <xsl:value-of select="@color"/></xsl:attribute>
			<input type="checkbox" checked="checked" data-click="toggle-calendar">
				<xsl:attribute name="id">calendar-<xsl:value-of select="@id"/></xsl:attribute>
			</input>
			<i></i>
		</span>
		<label>
			<xsl:attribute name="for">calendar-<xsl:value-of select="@id"/></xsl:attribute>
			<xsl:value-of select="@name"/>
		</label>
		<span class="cal-edit" data-click="edit-calendar-entry">Edit</span>
	</li>
</xsl:template>


<xsl:template name="popup-calendar-details">
	<xsl:variable name="current-color" select="@color"/>
	<div class="popup-bubble" data-type="calendar" data-area="popup">
		<xsl:if test="@isNew"><xsl:attribute name="class">popup-bubble is-new</xsl:attribute></xsl:if>
		<xsl:attribute name="data-calId"><xsl:value-of select="@id"/></xsl:attribute>
		<div class="row-head">
			<h3 contenteditable="true" placeholder="New Calendar" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
				<xsl:if test="@name != 'New Calendar'"><xsl:value-of select="@name"/></xsl:if>
			</h3>
		</div>
		<div class="row-colors">
			<span>Color:</span>
			<div data-click="change-calendar-color">
				<xsl:for-each select="//Data/Palette/*">
					<i>
						<xsl:attribute name="data-color"><xsl:value-of select="@id"/></xsl:attribute>
						<xsl:attribute name="class">calendar-color <xsl:value-of select="@id"/>
							<xsl:if test="@id = $current-color"> active</xsl:if>
						</xsl:attribute>
					</i>
				</xsl:for-each>
			</div>
		</div>
		<hr/>
		<div class="row-actions">
			<div class="pop-button disabled" title="Mail Calendar" data-click="sidebar-email-calendar">
				<i class="icon-email"></i>
			</div>
			<div class="pop-button" title="Delete Calendar" data-click="sidebar-delete-calendar">
				<i class="icon-trashcan"></i>
			</div>
		</div>
	</div>
</xsl:template>


<xsl:template name="popup-event">
	<div class="popup-bubble" data-type="event" data-area="popup">
		<xsl:if test="@isNew"><xsl:attribute name="class">popup-bubble is-new</xsl:attribute></xsl:if>
		<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>

		<xsl:choose>
			<xsl:when test="@type = 'day'">
				<div class="row-head">
					<i>
						<xsl:attribute name="class">calendar-color <xsl:value-of select="../@color"/></xsl:attribute>
					</i>
					<h3>
						<xsl:value-of select="@title"/>
					</h3>
				</div>
				<div class="row-date">
					<i class="icon-calendar"></i>
					<div>
						<span class="event-date"><xsl:value-of select="@i18n-date"/></span>
					</div>
				</div>
				<hr/>
				<div class="row-info">
					<i class="icon-info"></i>
					<div><xsl:value-of select="../@title"/></div>
				</div>
			</xsl:when>
			<xsl:otherwise>
				<div class="row-head">
					<i>
						<xsl:attribute name="class">calendar-color <xsl:value-of select="//Events/Calendars/*[@id = current()/@calendar-id]/@color"/></xsl:attribute>
					</i>
					<h3 contenteditable="true" placeholder="New Event" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
						<xsl:if test="not(@isNew)"><xsl:value-of select="@title"/></xsl:if>
					</h3>
				</div>
				<div class="row-location">
					<i class="icon-location-pin"></i>
					<input type="text" placeholder="Add Location"/>
				</div>
				<hr/>
				<div class="row-date">
					<i class="icon-calendar"></i>
					<div>
						<span class="event-date"><xsl:value-of select="@i18n-date"/></span>
						<span class="event-starts" data-change="popup-time-change"><xsl:value-of select="@i18n-starts"/></span>
						<span>to</span>
						<span class="event-ends" data-change="popup-time-change"><xsl:value-of select="@i18n-ends"/></span>
					</div>
				</div>
				<hr/>
				<div class="row-users">
					<i class="icon-user"></i>
					<input type="text" placeholder="Add Invitees"/>
				</div>
				<hr/>
				<div class="row-attachments">
					<i class="icon-paperclip"></i>
					<input type="text" placeholder="Add Notes, URL or Attachments"/>
				</div>
				<hr/>
				<div class="row-actions">
					<div class="pop-button disabled" title="Mail Event" data-click="email-event">
						<i class="icon-email"></i>
					</div>
					<div class="pop-button" title="Delete Event" data-click="delete-event">
						<i class="icon-trashcan"></i>
					</div>
				</div>
			</xsl:otherwise>
		</xsl:choose>
	</div>
</xsl:template>

</xsl:stylesheet>

